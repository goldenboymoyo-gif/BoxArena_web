from django.urls import reverse
from rest_framework.test import APITestCase

from apps.accounts.models import Role, User
from apps.payments.models import PaymentIntent, PaymentProviderConfig, PaymentStatus
from apps.payments.providers.mock_provider import build_signed_request

from .models import Plan, Subscription, SubscriptionStatus
from .services import activate_subscription, has_active_premium, start_subscription


def _make_user(role=Role.FAN, email="fan@example.com"):
    user = User.objects.create(email=email, first_name="T", last_name="User", role=role, is_email_verified=True)
    user.set_password("Str0ng!Passw0rd")
    user.save()
    return user


class PlanSeedTests(APITestCase):
    """The data migration (0003_seed_premium_plans) must have run in every
    environment, including this throwaway test DB, since tests run real
    migrations here (see pugnera/settings/sandbox_test.py)."""

    def test_monthly_and_yearly_premium_plans_exist_at_expected_price(self):
        monthly = Plan.objects.get(tier="PREMIUM", billing_interval="MONTHLY")
        yearly = Plan.objects.get(tier="PREMIUM", billing_interval="YEARLY")
        self.assertEqual(str(monthly.price), "10.00")
        self.assertEqual(str(yearly.price), "100.00")

    def test_plan_list_is_public(self):
        response = self.client.get(reverse("plan-list"))
        self.assertEqual(response.status_code, 200)
        results = response.data.get("results", response.data)
        tiers = {p["billing_interval"] for p in results}
        self.assertEqual(tiers, {"MONTHLY", "YEARLY"})

    def test_plan_has_role_specific_descriptions(self):
        monthly = Plan.objects.get(tier="PREMIUM", billing_interval="MONTHLY")
        self.assertIn("live fight", monthly.fan_description)
        self.assertIn("directory", monthly.boxer_description)
        self.assertNotEqual(monthly.fan_description, monthly.boxer_description)


class SubscriptionEntitlementTests(APITestCase):
    """The core security property this whole flow depends on: creating a
    Subscription row for an unpaid plan must NEVER by itself grant premium
    access — only a confirmed webhook may (spec §11-12)."""

    def setUp(self):
        self.user = _make_user()
        self.plan = Plan.objects.get(tier="PREMIUM", billing_interval="MONTHLY")

    def test_starting_a_subscription_does_not_grant_premium(self):
        subscription = start_subscription(self.user, self.plan)
        self.assertEqual(subscription.status, SubscriptionStatus.INCOMPLETE)
        self.assertFalse(has_active_premium(self.user))

    def test_activation_grants_premium(self):
        subscription = start_subscription(self.user, self.plan)
        activate_subscription(subscription)
        self.assertTrue(has_active_premium(self.user))


class StartSubscriptionEndpointTests(APITestCase):
    def setUp(self):
        self.user = _make_user(email="fan2@example.com")
        self.plan = Plan.objects.get(tier="PREMIUM", billing_interval="MONTHLY")
        PaymentProviderConfig.objects.get_or_create(
            key="mock", defaults={"display_name": "Mock", "enabled": True}
        )
        self.client.force_authenticate(self.user)

    def test_subscribe_creates_incomplete_subscription_and_intent(self):
        response = self.client.post(reverse("start-subscription"), {"plan_id": str(self.plan.id)})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["subscription"]["status"], "INCOMPLETE")
        self.assertIn("intent", response.data)
        self.assertFalse(has_active_premium(self.user))

    def test_cannot_subscribe_to_unknown_plan(self):
        import uuid

        response = self.client.post(reverse("start-subscription"), {"plan_id": str(uuid.uuid4())})
        self.assertEqual(response.status_code, 404)

    def test_full_purchase_flow_grants_premium_only_after_webhook(self):
        start_response = self.client.post(reverse("start-subscription"), {"plan_id": str(self.plan.id)})
        intent_id = start_response.data["intent"]["id"]
        intent = PaymentIntent.objects.get(id=intent_id)
        subscription = Subscription.objects.get(user=self.user)
        self.assertFalse(has_active_premium(self.user))

        event = {
            "event_id": "evt_sub_1",
            "event_type": "payment.succeeded",
            "provider_transaction_id": "txn_sub_1",
            "status": PaymentStatus.SUCCEEDED,
            "amount": str(self.plan.price),
            "currency": self.plan.currency,
            "order_reference": intent.provider_intent_id,
        }
        body, signature = build_signed_request(event)
        response = self.client.generic(
            "POST", reverse("payment-webhook", args=["mock"]), data=body,
            content_type="application/json", HTTP_X_MOCK_SIGNATURE=signature,
        )
        self.assertEqual(response.status_code, 200)

        subscription.refresh_from_db()
        self.assertEqual(subscription.status, SubscriptionStatus.ACTIVE)
        self.assertTrue(has_active_premium(self.user))
