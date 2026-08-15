import uuid

from django.db import models

from apps.core.models import TimeStampedModel


class EventStatus(models.TextChoices):
    SCHEDULED = "SCHEDULED", "Scheduled"
    LIVE = "LIVE", "Live"
    COMPLETED = "COMPLETED", "Completed"
    CANCELED = "CANCELED", "Canceled"


class Event(TimeStampedModel):
    """A ticketed boxing event/fight card. Distinct from streams.LiveEvent
    (which tracks externally-sourced broadcast metadata) — this is
    Pugnera's own sellable event with tickets/PPV."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    headline = models.CharField(max_length=255, blank=True)
    organization = models.ForeignKey(
        "boxing.Organization", null=True, blank=True, on_delete=models.SET_NULL, related_name="events"
    )

    date = models.DateField()
    time = models.CharField(max_length=20, blank=True)
    timezone = models.CharField(max_length=10, default="ET")

    venue = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=120, blank=True)

    status = models.CharField(max_length=15, choices=EventStatus.choices, default=EventStatus.SCHEDULED)
    is_ppv = models.BooleanField(default=False)
    poster_image_key = models.CharField(max_length=255, blank=True)

    class Meta:
        indexes = [models.Index(fields=["date", "status"])]

    def __str__(self):
        return self.title
