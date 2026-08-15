"""Seeds the two PREMIUM plans: $10/month, $100/year (2 months free vs.
straight 12x monthly). Same plans serve both FAN and BOXER accounts — what
premium unlocks differs by the subscriber's role at the application layer
(free live-stream access for fans, boosted directory placement for
boxers), not by having separate plan rows. Idempotent via get_or_create so
re-running (e.g. in a fresh environment) never creates duplicates.
"""
from decimal import Decimal

from django.db import migrations


def seed_plans(apps, schema_editor):
    Plan = apps.get_model("subscriptions", "Plan")
    Plan.objects.get_or_create(
        tier="PREMIUM",
        billing_interval="MONTHLY",
        defaults={"price": Decimal("10.00"), "currency": "USD", "trial_days": 0, "is_active": True},
    )
    Plan.objects.get_or_create(
        tier="PREMIUM",
        billing_interval="YEARLY",
        defaults={"price": Decimal("100.00"), "currency": "USD", "trial_days": 0, "is_active": True},
    )


def unseed_plans(apps, schema_editor):
    Plan = apps.get_model("subscriptions", "Plan")
    Plan.objects.filter(
        tier="PREMIUM", billing_interval="MONTHLY", price=Decimal("10.00")
    ).delete()
    Plan.objects.filter(
        tier="PREMIUM", billing_interval="YEARLY", price=Decimal("100.00")
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("subscriptions", "0002_alter_subscription_status"),
    ]

    operations = [
        migrations.RunPython(seed_plans, unseed_plans),
    ]
