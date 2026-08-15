"""
Ingestion, deduplication, and live/upcoming/completed classification
(spec §10-13, §15, §17).
"""
import logging

from django.db import transaction
from django.utils import timezone
from django.utils.module_loading import import_string

from apps.audit.services import record_audit_event

from .models import LiveEvent, LiveEventStatus, LiveEventStream, StreamSource, compute_dedup_key

logger = logging.getLogger("django")

LIVE_WINDOW_MINUTES_BEFORE = 15  # events can flip to LIVE slightly before start_time
COMPLETED_AFTER_HOURS = 4  # auto-complete an event that never got an explicit "ended" signal


@transaction.atomic
def ingest_from_source(source: StreamSource):
    """Poll one enabled+verified source, normalize its events, and merge
    them into LiveEvent/LiveEventStream via dedup (spec §10, §15). Never
    called for a source that isn't both enabled and verified."""
    if not source.enabled or not source.verified:
        return []

    try:
        adapter_cls = import_string(source.adapter_class)
    except ImportError:
        source.last_error = f"Could not import adapter class: {source.adapter_class}"
        source.save(update_fields=["last_error"])
        return []

    adapter = adapter_cls()
    try:
        raw_events = adapter.fetch_events()
    except NotImplementedError as exc:
        # Expected for unconfigured adapters — not a failure, just nothing
        # to ingest yet.
        source.last_error = str(exc)
        source.last_polled_at = timezone.now()
        source.save(update_fields=["last_error", "last_polled_at"])
        return []
    except Exception as exc:  # noqa: BLE001
        logger.exception("stream_source_poll_failed")
        source.last_error = str(exc)[:500]
        source.last_polled_at = timezone.now()
        source.save(update_fields=["last_error", "last_polled_at"])
        return []

    created_or_updated = [_merge_event(source, raw) for raw in raw_events]
    source.last_error = ""
    source.last_polled_at = timezone.now()
    source.save(update_fields=["last_error", "last_polled_at"])
    return created_or_updated


def _merge_event(source: StreamSource, raw) -> LiveEvent:
    dedup_key = compute_dedup_key(
        fighter_1=raw.fighter_1, fighter_2=raw.fighter_2,
        event_date=raw.start_time.date(), organization=raw.organization,
    )
    event, created = LiveEvent.objects.get_or_create(
        dedup_key=dedup_key,
        defaults={
            "title": raw.title, "organization": raw.organization, "promotion": raw.promotion,
            "fighter_1": raw.fighter_1, "fighter_2": raw.fighter_2, "weight_class": raw.weight_class,
            "event_date": raw.start_time.date(), "start_time": raw.start_time,
            "venue": raw.venue, "location": raw.location, "thumbnail_url": raw.thumbnail_url,
            "is_free": raw.is_free, "is_verified": source.verified,
        },
    )
    if not created and source.verified:
        event.is_verified = True
        event.save(update_fields=["is_verified"])

    # One row per (event, source, url) — a fight seen on three legitimate
    # sources gets three LiveEventStream rows under one LiveEvent, never
    # three duplicate event cards (spec §15-16).
    LiveEventStream.objects.get_or_create(
        event=event, source=source, source_url=raw.source_url,
        defaults={
            "embed_url": raw.embed_url, "is_embeddable": raw.is_embeddable and source.embeddable,
            "requires_subscription": raw.requires_subscription, "requires_ppv": raw.requires_ppv,
        },
    )
    return event


def reclassify_event_statuses():
    """Advance UPCOMING -> LIVE -> COMPLETED purely from clock time, never
    from guesswork (spec §10-11). Run periodically via Celery beat."""
    now = timezone.now()

    live_threshold = now + timezone.timedelta(minutes=LIVE_WINDOW_MINUTES_BEFORE)
    LiveEvent.objects.filter(status=LiveEventStatus.UPCOMING, start_time__lte=live_threshold).update(
        status=LiveEventStatus.LIVE
    )

    completed_threshold = now - timezone.timedelta(hours=COMPLETED_AFTER_HOURS)
    LiveEvent.objects.filter(status=LiveEventStatus.LIVE, start_time__lte=completed_threshold).update(
        status=LiveEventStatus.COMPLETED
    )


def get_live_feed():
    """Priority order per spec §12:
    1. VERIFIED + LIVE + FREE
    2. VERIFIED + LIVE
    3. VERIFIED + UPCOMING + FREE
    4. VERIFIED + UPCOMING
    Never includes COMPLETED events, and returns an empty list (not
    fabricated content) when nothing qualifies (spec §13)."""
    base = LiveEvent.objects.filter(is_verified=True).exclude(
        status__in=[LiveEventStatus.COMPLETED, LiveEventStatus.CANCELLED, LiveEventStatus.UNAVAILABLE]
    )
    live_free = list(base.filter(status=LiveEventStatus.LIVE, is_free=True).order_by("start_time"))
    live_other = list(
        base.filter(status=LiveEventStatus.LIVE, is_free=False).order_by("start_time")
    )
    upcoming_free = list(base.filter(status=LiveEventStatus.UPCOMING, is_free=True).order_by("start_time"))
    upcoming_other = list(base.filter(status=LiveEventStatus.UPCOMING, is_free=False).order_by("start_time"))
    return live_free + live_other + upcoming_free + upcoming_other


def set_source_enabled(source: StreamSource, *, enabled: bool, actor):
    source.enabled = enabled
    source.save(update_fields=["enabled"])
    record_audit_event(
        action="stream_source.enabled" if enabled else "stream_source.disabled",
        actor=actor, object_type="stream_source", object_id=source.id,
    )


def set_source_verified(source: StreamSource, *, verified: bool, actor):
    source.verified = verified
    source.save(update_fields=["verified"])
    record_audit_event(
        action="stream_source.verified" if verified else "stream_source.unverified",
        actor=actor, object_type="stream_source", object_id=source.id,
    )
