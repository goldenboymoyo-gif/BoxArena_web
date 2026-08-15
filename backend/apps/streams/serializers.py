from rest_framework import serializers

from .models import LiveEvent, LiveEventStream, StreamSource


class LiveEventStreamSerializer(serializers.ModelSerializer):
    source_name = serializers.CharField(source="source.name", read_only=True)
    source_tier = serializers.CharField(source="source.tier", read_only=True)

    class Meta:
        model = LiveEventStream
        fields = [
            "id", "source_name", "source_tier", "source_url", "embed_url",
            "is_embeddable", "requires_subscription", "requires_ppv",
        ]
        read_only_fields = fields


class LiveEventSerializer(serializers.ModelSerializer):
    streams = LiveEventStreamSerializer(many=True, read_only=True)

    class Meta:
        model = LiveEvent
        fields = [
            "id", "title", "organization", "promotion", "fighter_1", "fighter_2",
            "weight_class", "event_date", "start_time", "timezone", "venue", "location",
            "thumbnail_url", "status", "is_free", "is_verified", "streams",
        ]
        read_only_fields = fields


class StreamSourceAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = StreamSource
        fields = [
            "id", "key", "name", "source_type", "tier", "website_url", "api_endpoint",
            "adapter_class", "embeddable", "enabled", "verified", "last_polled_at", "last_error",
        ]
        read_only_fields = ["id", "last_polled_at", "last_error"]
