from rest_framework import serializers

from .models import Ticket, TicketType


class TicketTypeSerializer(serializers.ModelSerializer):
    is_sold_out = serializers.BooleanField(read_only=True)

    class Meta:
        model = TicketType
        fields = ["id", "event", "name", "price", "currency", "is_sold_out"]
        read_only_fields = fields


class TicketSerializer(serializers.ModelSerializer):
    ticket_type = TicketTypeSerializer(read_only=True)

    class Meta:
        model = Ticket
        fields = ["id", "ticket_type", "status", "signed_token", "scanned_at", "created_at"]
        read_only_fields = fields


class ScanTicketSerializer(serializers.Serializer):
    token = serializers.CharField()
