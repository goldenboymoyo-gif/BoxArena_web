"""
Multi-source legal boxing stream aggregation (see PUGNERA — MULTI-SOURCE
LEGAL BOXING STREAM AGGREGATION spec).

Hard rule enforced throughout this app: "free" is not the same as
"legitimate". Nothing here fetches, proxies, re-hosts, or links to a
pirated/unauthorized restream. A StreamSource only ever contributes
events once an operator has verified it is an official/authorized source
(tier + `verified`), and adapters only return data — they never bypass a
paywall or DRM.
"""
import hashlib
import uuid

from django.db import models

from apps.core.models import TimeStampedModel


class SourceType(models.TextChoices):
    YOUTUBE = "YOUTUBE", "YouTube"
    FEDERATION = "FEDERATION", "Boxing federation"
    PROMOTER = "PROMOTER", "Promoter"
    BROADCASTER = "BROADCASTER", "Free broadcaster"
    EVENT_WEBSITE = "EVENT_WEBSITE", "Official event website"
    SOCIAL = "SOCIAL", "Official social livestream"


class SourceTier(models.TextChoices):
    TIER1_OFFICIAL = "TIER1_OFFICIAL", "Tier 1 — Official"
    TIER2_AUTHORIZED = "TIER2_AUTHORIZED", "Tier 2 — Authorized partner"
    TIER3_PUBLIC = "TIER3_PUBLIC", "Tier 3 — Public legitimate broadcast"


class StreamSource(TimeStampedModel):
    """Admin-manageable source registry (spec §14). Adding a new legitimate
    source is a database row + an adapter class — never a Live-page code
    change."""

    key = models.SlugField(unique=True)
    name = models.CharField(max_length=150)
    source_type = models.CharField(max_length=20, choices=SourceType.choices)
    tier = models.CharField(max_length=20, choices=SourceTier.choices, default=SourceTier.TIER3_PUBLIC)

    website_url = models.URLField(blank=True)
    api_endpoint = models.URLField(blank=True)
    # Dotted path to a apps.streams.adapters.base.StreamSourceAdapter subclass.
    adapter_class = models.CharField(max_length=255)

    embeddable = models.BooleanField(default=False, help_text="Source's terms permit embedding their player")

    enabled = models.BooleanField(default=False)
    verified = models.BooleanField(
        default=False, help_text="Only verified sources' events are shown to users (spec §5)."
    )

    last_polled_at = models.DateTimeField(null=True, blank=True)
    last_error = models.CharField(max_length=500, blank=True)

    def __str__(self):
        return self.name


class LiveEventStatus(models.TextChoices):
    UPCOMING = "UPCOMING", "Upcoming"
    LIVE = "LIVE", "Live"
    COMPLETED = "COMPLETED", "Completed"
    CANCELLED = "CANCELLED", "Cancelled"
    UNAVAILABLE = "UNAVAILABLE", "Unavailable"


def compute_dedup_key(*, fighter_1: str, fighter_2: str, event_date, organization: str) -> str:
    """The same real-world fight discovered via two different sources must
    collapse into one LiveEvent, not two duplicate cards (spec §15)."""
    fighters = sorted([fighter_1.strip().lower(), fighter_2.strip().lower()])
    raw = f"{fighters[0]}|{fighters[1]}|{event_date}|{organization.strip().lower()}"
    return hashlib.sha256(raw.encode()).hexdigest()


class LiveEvent(TimeStampedModel):
    """Normalized event shared by every source (spec §4). A single
    LiveEvent can be backed by multiple LiveEventStream rows (spec §15-16)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dedup_key = models.CharField(max_length=64, db_index=True)

    title = models.CharField(max_length=255)
    organization = models.CharField(max_length=150, blank=True)
    promotion = models.CharField(max_length=150, blank=True)
    fighter_1 = models.CharField(max_length=150)
    fighter_2 = models.CharField(max_length=150)
    weight_class = models.CharField(max_length=50, blank=True)

    event_date = models.DateField()
    start_time = models.DateTimeField()
    timezone = models.CharField(max_length=50, default="UTC")

    venue = models.CharField(max_length=200, blank=True)
    location = models.CharField(max_length=200, blank=True)
    thumbnail_url = models.URLField(blank=True)

    status = models.CharField(max_length=15, choices=LiveEventStatus.choices, default=LiveEventStatus.UPCOMING)
    is_free = models.BooleanField(default=False)
    # An event is only user-visible once at least one of its streams is
    # from a verified source — see services/classify.py.
    is_verified = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=["dedup_key"]),
            models.Index(fields=["status", "start_time"]),
        ]

    def __str__(self):
        return f"{self.fighter_1} vs {self.fighter_2} ({self.status})"


class LiveEventStream(TimeStampedModel):
    """One legitimate watch option for a LiveEvent. Never a proxied/re-hosted
    copy of the broadcast — either an officially-permitted embed, or a
    link out to the original source (spec §8, §9)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(LiveEvent, on_delete=models.CASCADE, related_name="streams")
    source = models.ForeignKey(StreamSource, on_delete=models.PROTECT, related_name="streams")

    source_url = models.URLField()
    embed_url = models.URLField(blank=True)
    is_embeddable = models.BooleanField(default=False)

    requires_subscription = models.BooleanField(default=False)
    requires_ppv = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["event", "source", "source_url"], name="uniq_event_source_url"),
        ]
