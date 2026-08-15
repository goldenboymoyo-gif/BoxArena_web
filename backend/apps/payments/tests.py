import json
import uuid
from decimal import Decimal

from django.urls import reverse
from rest_framework.test import APITestCase

from apps.accounts.models import Role, User
from apps.orders.models import Order, OrderStatus, OrderType

from . import services
from .models import PaymentIntent, PaymentStatus, PaymentTransaction
from .providers.mock_provider import build_signed_request


def _make_verified_user(email="fan@example.com") -> User:
    user = User(email=email, first_name="Jordan", last_name="Diaz", role=Role.FAN, is_email_verified=True)
    user.set_password("Str0ng!Passw0rd")
    user.full_clean(exclude=["password"])
    user.save()
    from apps.accounts.models import FanProfile

    FanProfile.objects.create(user=user)
    return user


def _make_order(user, amount="49.99") -> Order:
    return Order.objects.create(
        id=uuid.uuid4(), user=user, order_type=OrderType.PPV, status=OrderStatus.PENDING,
        total_amount=Decimal(amount), currency="USD",
    )


def _post_webhook(client, event: dict):
    body, signature = build_signed_request(event)
    return client.generic(
        "POST", reverse("payment-webhook", args=["mock"]), data=body,
        content_type="application/json", HTTP_X_MOCK_SIGNATURE=signature,
    )


class CreatePaymentIntentTests(APITestCase):
    def setUp(self):
        self.user = _make_verified_user()
        self.other_user = _make_verified_user("other@example.com")
        self.order = _make_order(self.user, amount="49.99")
        self.client.force_authenticate(self.user)

    def test_intent_amount_comes_from_order_not_client(self):
        """spec §15/§35: even if a client tried to smuggle a different
        amount, CreatePaymentIntentSerializer doesn't accept one at all —
        the intent's amount is read from the order server-side."""
        response = self.client.post(
            reverse("create-payment-intent"), {"order_id": str(self.order.id), "amount": "0.01"}, format="json"
        )
        self.assertEqual(response.status_code, 201)
        intent = PaymentIntent.objects.get(order=self.order)
        self.assertEqual(intent.amount, Decimal("49.99"))

    def test_user_cannot_create_intent_for_another_users_order(self):
        self.client.force_authenticate(self.other_user)
        response = self.client.post(reverse("create-payment-intent"), {"order_id": str(self.order.id)}, format="json")
        self.assertEqual(response.status_code, 404)
        self.assertFalse(PaymentIntent.objects.filter(order=self.order).exists())

    def test_duplicate_intent_request_is_idempotent(self):
        r1 = self.client.post(reverse("create-payment-intent"), {"order_id": str(self.order.id)}, format="json")
        r2 = self.client.post(reverse("create-payment-intent"), {"order_id": str(self.order.id)}, format="json")
        self.assertEqual(r1.data["intent"]["id"], r2.data["intent"]["id"])
        self.assertEqual(PaymentIntent.objects.filter(order=self.order).count(), 1)


class WebhookSecurityTests(APITestCase):
    def setUp(self):
        self.user = _make_verified_user()
        self.order = _make_order(self.user, amount="49.99")
        self.intent, _ = services.create_payment_intent_for_order(user=self.user, order=self.order)

    def _valid_event(self, **overrides):
        event = {
            "event_id": "evt_1",
            "event_type": "payment.succeeded",
            "provider_transaction_id": "txn_1",
            "status": PaymentStatus.SUCCEEDED,
            "amount": "49.99",
            "currency": "USD",
            "order_reference": self.intent.provider_intent_id,
        }
        event.update(overrides)
        return event

    def test_invalid_signature_is_rejected(self):
        event = self._valid_event()
        body = json.dumps(event).encode()
        response = self.client.generic(
            "POST", reverse("payment-webhook", args=["mock"]), data=body,
            content_type="application/json", HTTP_X_MOCK_SIGNATURE="not-a-real-signature",
        )
        self.assertEqual(response.status_code, 400)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, OrderStatus.PENDING)

    def test_missing_signature_is_rejected(self):
        event = self._valid_event()
        body = json.dumps(event).encode()
        response = self.client.generic(
            "POST", reverse("payment-webhook", args=["mock"]), data=body, content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_valid_webhook_marks_order_paid(self):
        response = _post_webhook(self.client, self._valid_event())
        self.assertEqual(response.status_code, 200)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, OrderStatus.PAID)
        self.assertEqual(PaymentTransaction.objects.get(provider_transaction_id="txn_1").status, PaymentStatus.SUCCEEDED)

    def test_duplicate_webhook_does_not_double_process(self):
        """spec §9-10: a duplicate webhook delivery must be a no-op, never
        a second order/entitlement grant."""
        r1 = _post_webhook(self.client, self._valid_event())
        r2 = _post_webhook(self.client, self._valid_event())
        self.assertEqual(r1.status_code, 200)
        self.assertEqual(r2.status_code, 200)
        self.assertEqual(r2.data["result"], "duplicate")
        self.assertEqual(PaymentTransaction.objects.filter(provider_transaction_id="txn_1").count(), 1)

    def test_tampered_amount_is_rejected(self):
        """spec §9: never trust the webhook's amount blindly — it must
        match what the server itself calculated at intent-creation time."""
        event = self._valid_event(amount="0.01", event_id="evt_tampered")
        response = _post_webhook(self.client, event)
        self.assertEqual(response.status_code, 400)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, OrderStatus.PENDING)

    def test_tampered_currency_is_rejected(self):
        event = self._valid_event(currency="ZWG", event_id="evt_tampered_2")
        response = _post_webhook(self.client, event)
        self.assertEqual(response.status_code, 400)

    def test_unknown_order_reference_is_rejected(self):
        event = self._valid_event(order_reference="mock_intent_does_not_exist", event_id="evt_unknown")
        response = _post_webhook(self.client, event)
        self.assertEqual(response.status_code, 400)


class RefundAuthorizationTests(APITestCase):
    def setUp(self):
        self.user = _make_verified_user()
        self.order = _make_order(self.user, amount="49.99")
        self.intent, _ = services.create_payment_intent_for_order(user=self.user, order=self.order)
        event = {
            "event_id": "evt_paid", "event_type": "payment.succeeded", "provider_transaction_id": "txn_paid",
            "status": PaymentStatus.SUCCEEDED, "amount": "49.99", "currency": "USD",
            "order_reference": self.intent.provider_intent_id,
        }
        _post_webhook(self.client, event)
        self.transaction = PaymentTransaction.objects.get(provider_transaction_id="txn_paid")

    def test_ordinary_user_cannot_self_refund(self):
        """spec §14: refund permissions are restricted to FINANCE/ADMIN —
        a user must not be able to refund their own transaction."""
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("request-refund"),
            {"transaction_id": str(self.transaction.id), "amount": "49.99", "reason": "changed my mind"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_finance_role_can_refund(self):
        finance_user = _make_verified_user("finance@example.com")
        finance_user.role = Role.FINANCE
        finance_user.save(update_fields=["role"])
        self.client.force_authenticate(finance_user)
        response = self.client.post(
            reverse("request-refund"),
            {"transaction_id": str(self.transaction.id), "amount": "49.99", "reason": "duplicate charge"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["status"], "SUCCEEDED")
