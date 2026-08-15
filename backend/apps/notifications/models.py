import uuid

from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class NotificationType(models.TextChoices):
    EVENT_REMINDER = "EVENT_REMINDER", "Event reminder"
    PAYMENT = "PAYMENT", "Payment"
    SUBSCRIPTION = "SUBSCRIPTION", "Subscription"
    MODERATION = "MODERATION", "Moderation"
    SYSTEM = "SYSTEM", "System"


class Notification(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    notification_type = models.CharField(max_length=20, choices=NotificationType.choices)
    title = models.CharField(max_length=200)
    body = models.CharField(max_length=500, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        indexes = [models.Index(fields=["user", "read_at"])]
