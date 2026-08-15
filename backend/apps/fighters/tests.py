import uuid

from django.urls import reverse
from rest_framework.test import APITestCase

from apps.accounts.models import BoxerProfile, Role, User
from apps.subscriptions.models import Plan, Subscription, SubscriptionStatus

from .models import Fighter


def _make_boxer(email) -> User:
    user = User.objects.create(email=email, first_name="B", last_name="Oxer", role=Role.BOXER, is_email_verified=True)
    user.set_password("Str0ng!Passw0rd")
    user.save()
    BoxerProfile.objects.create(user=user, highlight_video_url="https://youtube.com/watch?v=highlight")
    return user


class BoostedPlacementTests(APITestCase):
    """spec ask: a boxer's PREMIUM subscription = advertising placement —
    boosted profiles must rank first within their weight class and surface
    their highlight reel; unboosted profiles must not."""

    def setUp(self):
        self.plan = Plan.objects.get(tier="PREMIUM", billing_interval="MONTHLY")
        self.boosted_user = _make_boxer("boosted@example.com")
        self.plain_user = _make_boxer("plain@example.com")

        Subscription.objects.create(
            id=uuid.uuid4(), user=self.boosted_user, plan=self.plan, status=SubscriptionStatus.ACTIVE,
        )

        self.boosted_fighter = Fighter.objects.create(
            id=uuid.uuid4(), user=self.boosted_user, full_name="Boosted Boxer", weight_class="Welterweight", ranking=5,
        )
        self.plain_fighter = Fighter.objects.create(
            id=uuid.uuid4(), user=self.plain_user, full_name="Plain Boxer", weight_class="Welterweight", ranking=1,
        )

    def test_boosted_fighter_ranks_above_lower_numbered_ranking(self):
        response = self.client.get(reverse("fighter-list"))
        self.assertEqual(response.status_code, 200)
        results = response.data.get("results", response.data)
        names = [f["full_name"] for f in results]
        self.assertLess(names.index("Boosted Boxer"), names.index("Plain Boxer"))

    def test_only_boosted_fighter_exposes_highlight_video(self):
        response = self.client.get(reverse("fighter-list"))
        results = response.data.get("results", response.data)
        by_name = {f["full_name"]: f for f in results}
        self.assertTrue(by_name["Boosted Boxer"]["is_boosted"])
        self.assertEqual(by_name["Boosted Boxer"]["highlight_video_url"], "https://youtube.com/watch?v=highlight")

        self.assertFalse(by_name["Plain Boxer"]["is_boosted"])
        self.assertEqual(by_name["Plain Boxer"]["highlight_video_url"], "")

    def test_canceled_subscription_loses_boost(self):
        sub = Subscription.objects.get(user=self.boosted_user)
        sub.status = SubscriptionStatus.CANCELED
        sub.save(update_fields=["status"])

        response = self.client.get(reverse("fighter-detail", args=[self.boosted_fighter.id]))
        self.assertFalse(response.data["is_boosted"])
        self.assertEqual(response.data["highlight_video_url"], "")
