"""
Payment data model (spec §6-9, §33).

Pugnera never stores full card numbers, CVV, or magnetic-stripe data — only
the minimum provider-supplied metadata needed for business operations.
PaymentTransaction rows are effectively immutable once SUCCEEDED/FAILED:
application code must go through services.py rather than editing them
directly, and Refund is a separate, authorization-controlled model rather
than a mutation of the original transaction.
"""
import uuid

from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class Currency(models.TextChoices):
    USD = "USD", "US Dollar"
    ZWG = "ZWG", "Zimbabwe Gold"
    ZAR = "ZAR", "South African Rand"


class PaymentMethodType(models.TextChoices):
    VISA = "VISA", "Visa"
    MASTERCARD = "MASTERCARD", "Mastercard"
    ECOCASH = "ECOCASH", "EcoCash"
    MOBILE_MONEY = "MOBILE_MONEY", "Mobile money"
    BANK_TRANSFER = "BANK_TRANSFER", "Bank transfer"
    APPLE_PAY = "APPLE_PAY", "Apple Pay"
    GOOGLE_PAY = "GOOGLE_PAY", "Google Pay"
    OTHER = "OTHER", "Other"


class PaymentStatus(models.TextChoices):
    REQUIRES_PAYMENT = "REQUIRES_PAYMENT", "Requires payment"
    REQUIRES_ACTION = "REQUIRES_ACTION", "Requires customer action"
    PROCESSING = "PROCESSING", "Processing"
    SUCCEEDED = "SUCCEEDED", "Succeeded"
    FAILED = "FAILED", "Failed"
    CANCELED = "CANCELED", "Canceled"


class RefundStatus(models.TextChoices):
    REQUESTED = "REQUESTED", "Requested"
    APPROVED = "APPROVED", "Approved"
    PROCESSING = "PROCESSING", "Processing"
    SUCCEEDED = "SUCCEEDED", "Succeeded"
    REJECTED = "REJECTED", "Rejected"
    FAILED = "FAILED", "Failed"


class PaymentProviderConfig(TimeStampedModel):
    """A configured payment processor. `key` must match an entry in
    settings.PAYMENT_PROVIDERS mapping to an adapter class (spec §33) — this
    row is *configuration/coverage metadata*, the adapter class holds the
    actual integration code.
    """

    key = models.SlugField(unique=True)
    display_name = models.CharField(max_length=100)
    countries = models.JSONField(default=list, help_text="ISO country codes this provider is verified for")
    supported_methods = models.JSONField(default=list)
    supports_recurring = models.BooleanField(default=False)
    supports_refunds = models.BooleanField(default=False)
    is_live = models.BooleanField(default=False, help_text="False = sandbox/test credentials only")
    enabled = models.BooleanField(default=False)

    def __str__(self):
        return self.display_name


class PaymentMethod(TimeStampedModel):
    """A tokenized payment method. The token comes from the provider — we
    never see or store the underlying card number/CVV (spec §6)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payment_methods")
    provider = models.ForeignKey(PaymentProviderConfig, on_delete=models.PROTECT, related_name="payment_methods")
    provider_customer_id = models.CharField(max_length=255)
    provider_payment_method_token = models.CharField(max_length=255)

    method_type = models.CharField(max_length=20, choices=PaymentMethodType.choices)
    card_brand = models.CharField(max_length=30, blank=True)
    last4 = models.CharField(max_length=4, blank=True)
    expires_month = models.PositiveSmallIntegerField(null=True, blank=True)
    expires_year = models.PositiveSmallIntegerField(null=True, blank=True)

    is_default = models.BooleanField(default=False)

    class Meta:
        indexes = [models.Index(fields=["user"])]


class PaymentIntent(TimeStampedModel):
    """Created before a charge is attempted. Amount/currency are always
    computed server-side from the order/subscription/PPV product — never
    taken from the client (spec §15, §35)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    idempotency_key = models.CharField(max_length=255, unique=True)

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="payment_intents")
    provider = models.ForeignKey(PaymentProviderConfig, on_delete=models.PROTECT, related_name="intents")

    order = models.ForeignKey("orders.Order", null=True, blank=True, on_delete=models.PROTECT, related_name="payment_intents")
    subscription = models.ForeignKey(
        "subscriptions.Subscription", null=True, blank=True, on_delete=models.PROTECT, related_name="payment_intents"
    )

    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, choices=Currency.choices)
    status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.REQUIRES_PAYMENT)

    provider_intent_id = models.CharField(max_length=255, blank=True)
    provider_reference = models.JSONField(default=dict, blank=True)

    class Meta:
        indexes = [models.Index(fields=["user", "status"]), models.Index(fields=["order"])]

    def clean(self):
        from django.core.exceptions import ValidationError

        if self.order_id and self.subscription_id:
            raise ValidationError("A payment intent must target either an order or a subscription, not both.")
        if not self.order_id and not self.subscription_id:
            raise ValidationError("A payment intent must target an order or a subscription.")


class PaymentTransaction(TimeStampedModel):
    """Immutable-by-convention ledger row. Only apps.payments.services
    should transition `status`, always inside an atomic block keyed by
    provider_transaction_id (spec §9-10)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    intent = models.ForeignKey(PaymentIntent, on_delete=models.PROTECT, related_name="transactions")
    provider_transaction_id = models.CharField(max_length=255, unique=True)

    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, choices=Currency.choices)
    status = models.CharField(max_length=20, choices=PaymentStatus.choices)

    method_type = models.CharField(max_length=20, choices=PaymentMethodType.choices, blank=True)
    card_brand = models.CharField(max_length=30, blank=True)
    masked_last4 = models.CharField(max_length=4, blank=True)

    failure_reason = models.CharField(max_length=255, blank=True)
    provider_reference = models.JSONField(default=dict, blank=True)

    class Meta:
        indexes = [models.Index(fields=["intent"]), models.Index(fields=["status"])]


class WebhookEvent(TimeStampedModel):
    """Idempotency ledger for inbound provider webhooks (spec §9-10). The
    unique constraint on (provider, event_id) is what makes duplicate
    delivery a no-op instead of a duplicate charge/entitlement."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider = models.ForeignKey(PaymentProviderConfig, on_delete=models.PROTECT, related_name="webhook_events")
    event_id = models.CharField(max_length=255)
    event_type = models.CharField(max_length=100)

    signature_valid = models.BooleanField()
    processed_at = models.DateTimeField(null=True, blank=True)
    processing_result = models.CharField(max_length=20, blank=True)  # succeeded | rejected | error
    payload = models.JSONField(default=dict, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["provider", "event_id"], name="uniq_provider_event"),
        ]
        indexes = [models.Index(fields=["event_type", "created_at"])]


class Refund(TimeStampedModel):
    """Refunds are authorization-controlled: created only via
    apps.payments.services.request_refund / approve_refund, never by a raw
    user-facing endpoint that lets a user refund themselves (spec §14, §14)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction = models.ForeignKey(PaymentTransaction, on_delete=models.PROTECT, related_name="refunds")

    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, choices=Currency.choices)
    reason = models.CharField(max_length=255)

    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="refunds_requested"
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="refunds_approved"
    )

    status = models.CharField(max_length=20, choices=RefundStatus.choices, default=RefundStatus.REQUESTED)
    provider_refund_id = models.CharField(max_length=255, blank=True)
    provider_response = models.JSONField(default=dict, blank=True)
