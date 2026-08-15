from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from apps.audit.services import record_audit_event

from .models import Subscription, SubscriptionStatus


@transaction.atomic
def start_subscription(user, plan):
    """Create the Subscription row a payment intent will point at. Status
    is INCOMPLETE unless the plan itself grants a free trial — this row
    must never be entitlement-granting before a webhook confirms payment
    (see SubscriptionStatus.INCOMPLETE docstring, has_active_premium)."""
    if not plan.is_active:
        raise ValueError("This plan is not currently available.")

    if plan.trial_days > 0:
        status = SubscriptionStatus.TRIALING
        period_end = timezone.now() + timedelta(days=plan.trial_days)
    else:
        status = SubscriptionStatus.INCOMPLETE
        period_end = None

    subscription = Subscription.objects.create(
        user=user, plan=plan, status=status, current_period_end=period_end,
    )
    record_audit_event(
        action="subscription.started", actor=user, object_type="subscription", object_id=subscription.id,
        metadata={"plan_id": str(plan.id), "tier": plan.tier, "billing_interval": plan.billing_interval},
    )
    return subscription


@transaction.atomic
def activate_subscription(subscription):
    """Called only after apps.payments.services confirms a verified
    SUCCEEDED webhook (spec §11-12) — never from a client claiming
    payment succeeded."""
    subscription.status = SubscriptionStatus.ACTIVE
    interval_days = 365 if subscription.plan.billing_interval == "YEARLY" else 30
    subscription.current_period_end = timezone.now() + timedelta(days=interval_days)
    subscription.save(update_fields=["status", "current_period_end"])
    record_audit_event(
        action="subscription.activated", actor=subscription.user, object_type="subscription", object_id=subscription.id
    )
    return subscription


@transaction.atomic
def cancel_subscription(subscription, *, requested_by):
    if subscription.user_id != requested_by.id and not getattr(requested_by, "is_staff", False):
        raise PermissionError("You cannot cancel another user's subscription.")
    subscription.status = SubscriptionStatus.CANCELED
    subscription.canceled_at = timezone.now()
    subscription.save(update_fields=["status", "canceled_at"])
    record_audit_event(
        action="subscription.canceled", actor=requested_by, object_type="subscription", object_id=subscription.id
    )
    return subscription


def has_active_premium(user) -> bool:
    """This is what PPV/premium-content views should call — never trust a
    client-sent `has_paid=true` flag (spec §11)."""
    return user.subscriptions.filter(
        status__in=[SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING], plan__tier="PREMIUM"
    ).exists()
