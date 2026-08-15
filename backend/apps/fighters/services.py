"""Boxer PREMIUM subscription -> boosted directory placement (spec ask:
"boxer subscription = advertising their account and highlights"). Boosted
status is computed live from an Exists subquery against Subscription,
never stored/cached on Fighter — the same "never trust a stale flag,
recompute from the payment/subscription source of truth" pattern used by
apps.subscriptions.services.has_active_premium.
"""
from django.db.models import Exists, OuterRef, QuerySet

from apps.subscriptions.models import Subscription, SubscriptionStatus


def annotate_boosted(queryset: QuerySet) -> QuerySet:
    active_premium = Subscription.objects.filter(
        user_id=OuterRef("user_id"),
        status__in=[SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
        plan__tier="PREMIUM",
    )
    return queryset.annotate(is_boosted=Exists(active_premium))
