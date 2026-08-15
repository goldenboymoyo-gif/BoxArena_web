import uuid

from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class AnalyticsEvent(TimeStampedModel):
    """Product-usage analytics only — never used for payment/security
    decisions (those go through apps.payments/apps.subscriptions). `user`
    is nullable so anonymous/pre-auth page views can still be recorded
    without fabricating an identity."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="analytics_events"
    )
    event_name = models.CharField(max_length=100, db_index=True)
    properties = models.JSONField(default=dict, blank=True)  # never store secrets/PII here

    class Meta:
        indexes = [models.Index(fields=["event_name", "created_at"])]
