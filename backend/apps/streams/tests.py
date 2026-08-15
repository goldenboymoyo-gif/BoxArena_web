import uuid
from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from apps.accounts.models import FanProfile, Role, User
from apps.streams.adapters.base import RawStreamEvent
from apps.streams.models import LiveEvent, LiveEventStatus, LiveEventStream, StreamSource
from apps.streams.services import get_live_feed, ingest_from_source, reclassify_event_statuses
from apps.subscriptions.models import Plan, Subscription, SubscriptionStatus


def _make_source(**overrides):
    defaults = dict(
        key="test-federation", name="Test Federation", source_type="FEDERATION", tier="TIER1_OFFICIAL",
        adapter_class="apps.streams.adapters.federation.FederationSourceAdapter",
        enabled=True, verified=True,
    )
    defaults.update(overrides)
    return StreamSource.objects.create(**defaults)


class FakeAdapter:
    """Test double standing in for a real adapter (spec §17: adapters are
    pluggable, so tests exercise the ingestion pipeline against a fake
    rather than a real network call)."""

    def __init__(self, events):
        self._events = events

    def fetch_events(self):
        return self._events


class EmptyStateTests(APITestCase):
    def test_live_feed_is_empty_list_when_nothing_verified(self):
        """spec §13: no verified free broadcasts -> empty list, never
        fabricated content."""
        response = self.client.get(reverse("live-feed"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])


class DeduplicationTests(APITestCase):
    def setUp(self):
        self.source_a = _make_source(key="source-a", name="Source A")
        self.source_b = _make_source(key="source-b", name="Source B")

    def test_same_fight_from_two_sources_collapses_into_one_event(self):
        start = timezone.now() + timedelta(days=1)
        event_a = RawStreamEvent(
            title="Canelo vs Crawford", fighter_1="Canelo Alvarez", fighter_2="Terence Crawford",
            organization="WBC", start_time=start, source_url="https://a.example.com/watch",
        )
        event_b = RawStreamEvent(
            # Same fight, different casing/order/source — must dedupe.
            title="CRAWFORD VS CANELO", fighter_1="Terence Crawford", fighter_2="Canelo Alvarez",
            organization="wbc", start_time=start, source_url="https://b.example.com/watch",
        )

        import apps.streams.services as services_module

        services_module.import_string = lambda path: (lambda: FakeAdapter([event_a]))
        ingest_from_source(self.source_a)
        services_module.import_string = lambda path: (lambda: FakeAdapter([event_b]))
        ingest_from_source(self.source_b)

        self.assertEqual(LiveEvent.objects.count(), 1)
        event = LiveEvent.objects.get()
        self.assertEqual(event.streams.count(), 2)

    def test_unverified_source_events_are_not_publicly_visible(self):
        self.source_a.verified = False
        self.source_a.save(update_fields=["verified"])
        start = timezone.now() + timedelta(hours=1)
        raw = RawStreamEvent(
            title="Unverified fight", fighter_1="A", fighter_2="B", organization="X",
            start_time=start, source_url="https://sketchy.example.com/watch",
        )
        import apps.streams.services as services_module

        services_module.import_string = lambda path: (lambda: FakeAdapter([raw]))
        result = ingest_from_source(self.source_a)
        # ingest_from_source is a no-op for a disabled/unverified source.
        self.assertEqual(result, [])
        self.assertEqual(LiveEvent.objects.count(), 0)


class ClassificationTests(APITestCase):
    def test_past_upcoming_event_is_not_returned_as_upcoming(self):
        """Both specs are explicit: an event from yesterday must never
        appear under Upcoming Fights."""
        _make_source()
        LiveEvent.objects.create(
            dedup_key="past-event", title="Old fight", fighter_1="A", fighter_2="B", organization="X",
            event_date=(timezone.now() - timedelta(days=1)).date(),
            start_time=timezone.now() - timedelta(days=1),
            status=LiveEventStatus.UPCOMING, is_verified=True,
        )
        response = self.client.get(reverse("upcoming-events"))
        self.assertEqual(response.data, [])

    def test_reclassify_moves_events_through_lifecycle(self):
        _make_source()
        soon = LiveEvent.objects.create(
            dedup_key="soon", title="Soon fight", fighter_1="A", fighter_2="B", organization="X",
            event_date=timezone.now().date(), start_time=timezone.now() + timedelta(minutes=5),
            status=LiveEventStatus.UPCOMING, is_verified=True,
        )
        long_live = LiveEvent.objects.create(
            dedup_key="stale-live", title="Stale live fight", fighter_1="C", fighter_2="D", organization="X",
            event_date=(timezone.now() - timedelta(hours=6)).date(),
            start_time=timezone.now() - timedelta(hours=6),
            status=LiveEventStatus.LIVE, is_verified=True,
        )
        reclassify_event_statuses()
        soon.refresh_from_db()
        long_live.refresh_from_db()
        self.assertEqual(soon.status, LiveEventStatus.LIVE)
        self.assertEqual(long_live.status, LiveEventStatus.COMPLETED)

    def test_completed_events_never_appear_in_live_feed(self):
        LiveEvent.objects.create(
            dedup_key="done", title="Done fight", fighter_1="A", fighter_2="B", organization="X",
            event_date=timezone.now().date(), start_time=timezone.now() - timedelta(hours=5),
            status=LiveEventStatus.COMPLETED, is_verified=True, is_free=True,
        )
        self.assertEqual(get_live_feed(), [])


class PriorityOrderingTests(APITestCase):
    def test_free_live_events_rank_above_paid_live_events(self):
        now = timezone.now()
        paid = LiveEvent.objects.create(
            dedup_key="paid-live", title="Paid live", fighter_1="A", fighter_2="B", organization="X",
            event_date=now.date(), start_time=now, status=LiveEventStatus.LIVE, is_verified=True, is_free=False,
        )
        free = LiveEvent.objects.create(
            dedup_key="free-live", title="Free live", fighter_1="C", fighter_2="D", organization="X",
            event_date=now.date(), start_time=now, status=LiveEventStatus.LIVE, is_verified=True, is_free=True,
        )
        feed = get_live_feed()
        self.assertEqual(feed[0].id, free.id)
        self.assertEqual(feed[1].id, paid.id)


class SubscriptionGatedStreamTests(APITestCase):
    """spec ask: a fan's PREMIUM subscription = free access to otherwise
    gated live fights. A stream flagged requires_subscription must hide its
    watch URL from anyone without an active premium subscription, and
    reveal it once they have one — never trusting a client-side flag."""

    def setUp(self):
        source = _make_source()
        event = LiveEvent.objects.create(
            dedup_key="gated-event", title="Gated fight", fighter_1="A", fighter_2="B", organization="X",
            event_date=timezone.now().date(), start_time=timezone.now(),
            status=LiveEventStatus.LIVE, is_verified=True, is_free=False,
        )
        LiveEventStream.objects.create(
            id=uuid.uuid4(), event=event, source=source,
            source_url="https://legit.example.com/watch/gated", embed_url="",
            requires_subscription=True,
        )
        self.plan = Plan.objects.get(tier="PREMIUM", billing_interval="MONTHLY")
        self.user = User.objects.create(email="fan@example.com", first_name="F", last_name="An", role=Role.FAN, is_email_verified=True)
        self.user.set_password("Str0ng!Passw0rd")
        self.user.save()
        FanProfile.objects.create(user=self.user)

    def test_anonymous_viewer_cannot_see_gated_stream_url(self):
        response = self.client.get(reverse("live-feed"))
        stream = response.data[0]["streams"][0]
        self.assertTrue(stream["locked"])
        self.assertIsNone(stream["source_url"])

    def test_viewer_without_premium_cannot_see_gated_stream_url(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("live-feed"))
        stream = response.data[0]["streams"][0]
        self.assertTrue(stream["locked"])
        self.assertIsNone(stream["source_url"])

    def test_premium_subscriber_can_see_gated_stream_url(self):
        Subscription.objects.create(
            id=uuid.uuid4(), user=self.user, plan=self.plan, status=SubscriptionStatus.ACTIVE,
        )
        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("live-feed"))
        stream = response.data[0]["streams"][0]
        self.assertFalse(stream["locked"])
        self.assertEqual(stream["source_url"], "https://legit.example.com/watch/gated")
