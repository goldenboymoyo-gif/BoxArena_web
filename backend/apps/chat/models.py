"""
Live chat models (spec §26: authentication, rate limiting, message length
limits, moderation, blocking, reporting)."""
import uuid

from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel

MAX_MESSAGE_LENGTH = 500


class ChatMessage(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.CharField(max_length=100, db_index=True, help_text="e.g. event id or 'global'")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="chat_messages")
    text = models.CharField(max_length=MAX_MESSAGE_LENGTH)

    # A message flagged/removed by moderation is retained (soft) rather
    # than deleted outright, for audit purposes, but hidden from clients.
    is_hidden = models.BooleanField(default=False)
    hidden_reason = models.CharField(max_length=255, blank=True)

    class Meta:
        indexes = [models.Index(fields=["room", "created_at"])]


class ChatBlock(TimeStampedModel):
    """A blocks B: B's messages are hidden from A client-side, and B cannot
    message A directly (if/when DMs exist)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    blocker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="chat_blocks_made")
    blocked = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="chat_blocks_received")

    class Meta:
        constraints = [models.UniqueConstraint(fields=["blocker", "blocked"], name="uniq_chat_block")]


class ChatReport(TimeStampedModel):
    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        REVIEWED = "REVIEWED", "Reviewed"
        DISMISSED = "DISMISSED", "Dismissed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name="reports")
    reported_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="chat_reports_made")
    reason = models.CharField(max_length=255)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.OPEN)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="chat_reports_reviewed"
    )
