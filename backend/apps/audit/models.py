import uuid

from django.conf import settings
from django.db import models


class AuditLog(models.Model):
    """Append-only record of sensitive actions (spec §19). Rows are never
    updated or deleted by application code — only ever inserted.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="audit_actions"
    )
    actor_label = models.CharField(max_length=150, blank=True, help_text="System/service actor when actor is null")

    action = models.CharField(max_length=100, db_index=True)
    object_type = models.CharField(max_length=100, blank=True)
    object_id = models.CharField(max_length=100, blank=True)

    result = models.CharField(max_length=20, default="success")  # success | failure
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    request_id = models.CharField(max_length=64, blank=True)

    # Never put passwords, tokens, CVVs, or other secrets in here (spec §19).
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["action", "created_at"]),
            models.Index(fields=["object_type", "object_id"]),
        ]

    def __str__(self):
        return f"{self.action} by {self.actor_id or self.actor_label} @ {self.created_at}"
