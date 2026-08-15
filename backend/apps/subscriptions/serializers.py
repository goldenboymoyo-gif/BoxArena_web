from rest_framework import serializers

from .models import Plan, Subscription


class StartSubscriptionSerializer(serializers.Serializer):
    plan_id = serializers.UUIDField()


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = [
            "id", "tier", "billing_interval", "price", "currency", "trial_days",
            "fan_description", "boxer_description",
        ]
        read_only_fields = fields


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)

    class Meta:
        model = Subscription
        fields = ["id", "plan", "status", "current_period_end", "canceled_at", "created_at"]
        read_only_fields = fields
