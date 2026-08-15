import uuid

from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class ModerationActionType(models.TextChoices):
    WARN = "WARN", "Warning"
    MUTE = "MUTE", "Chat mute"
    SUSPEND = "SUSPEND", "Account suspension"
    BAN = "BAN", "Account ban"
    CONTENT_REMOVED = "CONTENT_REMOVED", "Content removed"


class ModerationAction(TimeStampedModel):
    """User-facing trust & safety actions, distinct from apps.audit's
    technical event log — this is what a MODERATOR/ADMIN did and why, to
    a specific user, and is reviewable in its own right."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    target_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="moderation_actions_received"
    )
    moderator = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="moderation_actions_taken"
    )
    action_type = models.CharField(max_length=20, choices=ModerationActionType.choices)
    reason = models.CharField(max_length=500)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["target_user", "action_type"])]
