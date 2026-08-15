import uuid

from django.db import models

from apps.core.models import TimeStampedModel


class VideoType(models.TextChoices):
    HIGHLIGHT = "HIGHLIGHT", "Highlight"
    FULL_REPLAY = "FULL_REPLAY", "Full replay"
    INTERVIEW = "INTERVIEW", "Interview"
    PRESS_CONFERENCE = "PRESS_CONFERENCE", "Press conference"


class Video(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey("events.Event", null=True, blank=True, on_delete=models.SET_NULL, related_name="videos")
    fight = models.ForeignKey("fights.Fight", null=True, blank=True, on_delete=models.SET_NULL, related_name="videos")

    title = models.CharField(max_length=255)
    video_type = models.CharField(max_length=20, choices=VideoType.choices, default=VideoType.HIGHLIGHT)
    duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    thumbnail_url = models.URLField(blank=True)

    # Playback source lives in object storage / an external host — never a
    # re-hosted copy of a rights-restricted broadcast (same rule as
    # apps.streams: only legitimate, rights-cleared content).
    playback_url = models.URLField(blank=True)
    requires_subscription = models.BooleanField(default=False)

    class Meta:
        indexes = [models.Index(fields=["video_type"])]

    def __str__(self):
        return self.title
