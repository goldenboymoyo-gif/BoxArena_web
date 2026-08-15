from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("subscriptions", "0003_seed_premium_plans"),
    ]

    operations = [
        migrations.AddField(
            model_name="plan",
            name="fan_description",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="plan",
            name="boxer_description",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
    ]
