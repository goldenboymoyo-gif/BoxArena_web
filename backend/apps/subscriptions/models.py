import uuid

from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel
from apps.payments.models import Currency


class PlanTier(models.TextChoices):
    FREE = "FREE", "Free"
    PREMIUM = "PREMIUM", "Premium"


class BillingInterval(models.TextChoices):
    MONTHLY = "MONTHLY", "Monthly"
    YEARLY = "YEARLY", "Yearly"


class Plan(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tier = models.CharField(max_length=20, choices=PlanTier.choices)
    billing_interval = models.CharField(max_length=10, choices=BillingInterval.choices, null=True, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, choices=Currency.choices, default=Currency.USD)
    trial_days = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.tier} ({self.billing_interval or 'n/a'})"


class SubscriptionStatus(models.TextChoices):
    TRIALING = "TRIALING", "Trialing"
    ACTIVE = "ACTIVE", "Active"
    PAST_DUE = "PAST_DUE", "Past due"
    CANCELED = "CANCELED", "Canceled"
    EXPIRED = "EXPIRED", "Expired"


class Subscription(TimeStampedModel):
    """The payment provider remains the source of truth for payment state;
    this row is Pugnera's synchronized application-level entitlement
    (spec §12). Status transitions happen via apps.subscriptions.services,
    driven by verified webhook events — never by a client PATCH."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="subscriptions")
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT, related_name="subscriptions")
    status = models.CharField(max_length=15, choices=SubscriptionStatus.choices, default=SubscriptionStatus.TRIALING)

    current_period_end = models.DateTimeField(null=True, blank=True)
    canceled_at = models.DateTimeField(null=True, blank=True)
    provider_subscription_id = models.CharField(max_length=255, blank=True)

    class Meta:
        indexes = [models.Index(fields=["user", "status"])]
