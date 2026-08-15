from rest_framework import serializers

from .models import PaymentIntent, PaymentTransaction, Refund


class CreatePaymentIntentSerializer(serializers.Serializer):
    order_id = serializers.UUIDField()


class PaymentIntentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentIntent
        fields = ["id", "amount", "currency", "status", "provider_intent_id", "created_at"]
        read_only_fields = fields


class PaymentTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentTransaction
        fields = [
            "id", "amount", "currency", "status", "method_type", "card_brand",
            "masked_last4", "created_at",
        ]
        read_only_fields = fields


class RefundRequestSerializer(serializers.Serializer):
    transaction_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    reason = serializers.CharField(max_length=255)


class RefundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Refund
        fields = ["id", "amount", "currency", "reason", "status", "created_at"]
        read_only_fields = fields
