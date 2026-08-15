"""Backfills fan_description/boxer_description on the PREMIUM plans seeded
by 0003_seed_premium_plans.py. Split into its own migration (rather than
folding into 0003) so it can also be safely re-run/edited independently if
the copy changes later."""
from django.db import migrations

FAN_DESCRIPTION = (
    "Watch every subscription-gated live fight free — no PPV, no extra "
    "fees, just your monthly or annual plan."
)
BOXER_DESCRIPTION = (
    "Get boosted to the top of your weight class in the fighter directory "
    "and showcase your highlight reel to every fan on Pugnera."
)


def seed_descriptions(apps, schema_editor):
    Plan = apps.get_model("subscriptions", "Plan")
    Plan.objects.filter(tier="PREMIUM").update(
        fan_description=FAN_DESCRIPTION, boxer_description=BOXER_DESCRIPTION,
    )


def unseed_descriptions(apps, schema_editor):
    Plan = apps.get_model("subscriptions", "Plan")
    Plan.objects.filter(tier="PREMIUM").update(fan_description="", boxer_description="")


class Migration(migrations.Migration):

    dependencies = [
        ("subscriptions", "0004_plan_descriptions"),
    ]

    operations = [
        migrations.RunPython(seed_descriptions, unseed_descriptions),
    ]
