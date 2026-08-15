import uuid

from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class Fighter(TimeStampedModel):
    """The public fighter directory. May optionally be linked to a
    registered BOXER account (`user`), but also covers fighters who are
    listed/ranked on Pugnera without having created an account themselves.
    Record/ranking fields are editorial data — only staff can write them
    (see permissions in views.py), never the linked user directly, since a
    boxer must not be able to self-report a fabricated record."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="fighter_listing"
    )

    full_name = models.CharField(max_length=150)
    nickname = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=2, blank=True)
    weight_class = models.CharField(max_length=50, db_index=True)
    stance = models.CharField(max_length=10, blank=True)

    wins = models.PositiveIntegerField(default=0)
    losses = models.PositiveIntegerField(default=0)
    draws = models.PositiveIntegerField(default=0)
    knockouts = models.PositiveIntegerField(default=0)

    ranking = models.PositiveSmallIntegerField(null=True, blank=True, help_text="Rank within weight_class, if any")
    is_p4p = models.BooleanField(default=False)

    profile_image_key = models.CharField(max_length=255, blank=True)
    biography = models.TextField(blank=True)

    class Meta:
        indexes = [models.Index(fields=["weight_class", "ranking"])]

    def __str__(self):
        return self.full_name
