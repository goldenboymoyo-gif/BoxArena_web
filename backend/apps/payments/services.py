"""
Payment business logic (spec §2, §6-11, §15, §35).

Key rules enforced here, not in views:
  - Amount/currency always come from the server-side order/subscription
    total, never from the request body.
  - Webhook processing is atomic and idempotent on (provider, event_id).
  - Entitlements (ticket/PPV/subscription access) are only granted after
    the backend itself confirms SUCCEEDED status — never because the
    frontend claims payment succeeded.
"""
import logging
import uuid

from django.conf import settings
from django.db import IntegrityError, transaction
from django.utils.module_loading import import_string

from apps.audit.services import record_audit_event

from .models import (
    PaymentIntent,
    PaymentProviderConfig,
    PaymentStatus,
    PaymentTransaction,
    Refund,
    RefundStatus,
    WebhookEvent,
)

logger = logging.getLogger("pugnera.payments")


class PaymentError(Exception):
    pass


class WebhookVerificationError(PaymentError):
    pass


class WebhookValidationError(PaymentError):
    pass


def get_active_provider():
    key = settings.ACTIVE_PAYMENT_PROVIDER
    adapter_path = settings.PAYMENT_PROVIDERS[key]
    adapter_cls = import_string(adapter_path)
    config, _ = PaymentProviderConfig.objects.get_or_create(
        key=key, defaults={"display_name": key.title(), "enabled": True}
    )
    return config, adapter_cls()


def _order_total(order):
    """The only source of truth for what an order costs. Never accept a
    client-supplied price (spec §15, §35)."""
    return order.total_amount, order.currency


@transaction.atomic
def create_payment_intent_for_order(*, user, order, idempotency_key: str | None = None):
    if order.user_id != user.id:
        raise PermissionError("You do not own this order.")
    if order.status != "PENDING":
        raise PaymentError("This order is not payable in its current state.")

    amount, currency = _order_total(order)
    idempotency_key = idempotency_key or f"order:{order.id}"

    existing = PaymentIntent.objects.filter(idempotency_key=idempotency_key).first()
    if existing:
        return existing, {}

    config, adapter = get_active_provider()
    result = adapter.create_intent(
        amount=amount,
        currency=currency,
        order_reference=str(order.id),
        customer_id=str(user.id),
        idempotency_key=idempotency_key,
    )

    try:
        intent = PaymentIntent.objects.create(
            id=uuid.uuid4(),
            idempotency_key=idempotency_key,
            user=user,
            provider=config,
            order=order,
            amount=amount,
            currency=currency,
            status=PaymentStatus.REQUIRES_PAYMENT,
            provider_intent_id=result.provider_intent_id,
            provider_reference=result.provider_reference,
        )
    except IntegrityError:
        # Concurrent retry raced us — fetch the row the other request created.
        intent = PaymentIntent.objects.get(idempotency_key=idempotency_key)

    record_audit_event(
        action="payment.intent_created", actor=user, object_type="payment_intent", object_id=intent.id,
        metadata={"order_id": str(order.id), "amount": str(amount), "currency": currency},
    )
    return intent, result.client_payload


@transaction.atomic
def process_webhook(*, provider_key: str, raw_body: bytes, headers: dict):
    """Verify → validate → idempotency-check → atomically update →
    grant entitlement → audit (spec §9)."""
    config = PaymentProviderConfig.objects.filter(key=provider_key, enabled=True).first()
    if config is None:
        raise WebhookValidationError("Unknown or disabled payment provider.")

    adapter_path = settings.PAYMENT_PROVIDERS.get(provider_key)
    if not adapter_path:
        raise WebhookValidationError("Unknown payment provider.")
    adapter = import_string(adapter_path)()

    signature_valid = adapter.verify_webhook_signature(raw_body=raw_body, headers=dict(headers))
    if not signature_valid:
        record_audit_event(
            action="payment.webhook_rejected", actor_label=f"provider:{provider_key}", result="failure",
            metadata={"reason": "invalid_signature"},
        )
        raise WebhookVerificationError("Invalid webhook signature.")

    event = adapter.parse_webhook_event(raw_body=raw_body, headers=dict(headers))

    webhook_row, created = WebhookEvent.objects.get_or_create(
        provider=config,
        event_id=event.event_id,
        defaults={
            "event_type": event.event_type,
            "signature_valid": True,
            "payload": event.payload,
        },
    )
    if not created:
        # Duplicate delivery: spec §9-10 requires this be a strict no-op,
        # never a second order/subscription/ticket/entitlement.
        logger.info("duplicate_webhook_ignored", extra={"action": "payment.webhook_duplicate"})
        return webhook_row, "duplicate"

    try:
        intent = PaymentIntent.objects.select_for_update().get(provider_intent_id=event.order_reference)
    except PaymentIntent.DoesNotExist:
        # Some providers echo our own provider_transaction_id/order id
        # differently; try the transaction table as a fallback lookup key.
        intent = PaymentIntent.objects.select_for_update().filter(
            transactions__provider_transaction_id=event.provider_transaction_id
        ).first()

    if intent is None:
        webhook_row.processing_result = "rejected"
        webhook_row.processed_at = _now()
        webhook_row.save(update_fields=["processing_result", "processed_at"])
        record_audit_event(
            action="payment.webhook_rejected", actor_label=f"provider:{provider_key}", result="failure",
            metadata={"reason": "unknown_intent", "provider_transaction_id": event.provider_transaction_id},
        )
        raise WebhookValidationError("Webhook does not match a known payment intent.")

    # Never trust the webhook's amount/currency blindly — compare against
    # what we ourselves calculated when the intent was created (spec §9).
    if str(event.amount) != str(intent.amount) or event.currency != intent.currency:
        webhook_row.processing_result = "rejected"
        webhook_row.processed_at = _now()
        webhook_row.save(update_fields=["processing_result", "processed_at"])
        record_audit_event(
            action="payment.webhook_rejected", actor=intent.user, object_type="payment_intent", object_id=intent.id,
            result="failure", metadata={"reason": "amount_or_currency_mismatch"},
        )
        raise WebhookValidationError("Webhook amount/currency does not match the payment intent.")

    txn, txn_created = PaymentTransaction.objects.get_or_create(
        provider_transaction_id=event.provider_transaction_id,
        defaults={
            "intent": intent,
            "amount": intent.amount,
            "currency": intent.currency,
            "status": event.status,
        },
    )
    if not txn_created:
        txn.status = event.status
        txn.save(update_fields=["status"])

    intent.status = event.status
    intent.save(update_fields=["status"])

    if event.status == PaymentStatus.SUCCEEDED:
        _grant_entitlement(intent)

    webhook_row.processing_result = "succeeded"
    webhook_row.processed_at = _now()
    webhook_row.save(update_fields=["processing_result", "processed_at"])

    record_audit_event(
        action="payment.webhook_processed", actor=intent.user, object_type="payment_transaction", object_id=txn.id,
        metadata={"status": event.status},
    )
    return webhook_row, "processed"


def _now():
    from django.utils import timezone

    return timezone.now()


def _grant_entitlement(intent: PaymentIntent):
    """Only called after the backend itself has confirmed SUCCEEDED status
    via a verified webhook — never because a client claimed success
    (spec §11, §35)."""
    if intent.order_id:
        from apps.orders.services import mark_order_paid

        mark_order_paid(intent.order)
    elif intent.subscription_id:
        from apps.subscriptions.services import activate_subscription

        activate_subscription(intent.subscription)


@transaction.atomic
def request_refund(*, transaction_obj: PaymentTransaction, amount, reason: str, requested_by):
    """Refund creation is authorization-gated at the view layer
    (IsFinanceOrAdmin) — an ordinary user can never call this directly
    against their own transaction (spec §14)."""
    refund = Refund.objects.create(
        transaction=transaction_obj,
        amount=amount,
        currency=transaction_obj.currency,
        reason=reason,
        requested_by=requested_by,
        status=RefundStatus.REQUESTED,
    )
    record_audit_event(
        action="payment.refund_requested", actor=requested_by, object_type="refund", object_id=refund.id,
        metadata={"transaction_id": str(transaction_obj.id), "amount": str(amount)},
    )
    return refund


@transaction.atomic
def approve_refund(*, refund: Refund, approved_by):
    config, adapter = get_active_provider()
    result = adapter.create_refund(
        provider_transaction_id=refund.transaction.provider_transaction_id,
        amount=refund.amount,
        reason=refund.reason,
    )
    refund.status = result.status
    refund.provider_refund_id = result.provider_refund_id
    refund.provider_response = result.provider_response
    refund.approved_by = approved_by
    refund.save(update_fields=["status", "provider_refund_id", "provider_response", "approved_by"])

    record_audit_event(
        action="payment.refund_approved", actor=approved_by, object_type="refund", object_id=refund.id,
        metadata={"status": refund.status},
    )
    return refund
