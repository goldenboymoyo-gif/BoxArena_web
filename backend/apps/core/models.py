import uuid

from django.db import models


class UUIDModel(models.Model):
    """Use UUID primary keys for anything referenced in a public API so
    sequential integer IDs can't be enumerated (IDOR reconnaissance)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SoftDeleteQuerySet(models.QuerySet):
    def alive(self):
        return self.filter(deleted_at__isnull=True)


class SoftDeleteModel(models.Model):
    """Financial and identity-adjacent records should never be hard-deleted;
    see backend/README.md ("Data retention"). Soft delete preserves the row
    for audit/legal retention while hiding it from normal queries."""

    deleted_at = models.DateTimeField(null=True, blank=True)
    objects = SoftDeleteQuerySet.as_manager()

    class Meta:
        abstract = True

    def soft_delete(self):
        from django.utils import timezone

        self.deleted_at = timezone.now()
        self.save(update_fields=["deleted_at"])
