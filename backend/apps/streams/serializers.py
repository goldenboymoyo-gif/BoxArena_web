from rest_framework import serializers

from .models import LiveEvent, LiveEventStream, StreamSource


class LiveEventStreamSerializer(serializers.ModelSerializer):
    """A stream flagged requires_subscription is only watchable by a fan
    with an active PREMIUM subscription (spec: monthly/annual fan plan =
    free access to gated live fights) — enforced here, not just on the
    frontend, by redacting source_url/embed_url for anyone without it. This
    does not yet gate requires_ppv (a separate, not-yet-built one-off
    per-event purchase); that flag still passes through unredacted."""

    source_name = serializers.CharField(source="source.name", read_only=True)
    source_tier = serializers.CharField(source="source.tier", read_only=True)
    locked = serializers.SerializerMethodField()

    class Meta:
        model = LiveEventStream
        fields = [
            "id", "source_name", "source_tier", "source_url", "embed_url",
            "is_embeddable", "requires_subscription", "requires_ppv", "locked",
        ]
        read_only_fields = fields

    def get_locked(self, obj):
        return bool(obj.requires_subscription) and not self._viewer_has_premium()

    def _viewer_has_premium(self):
        request = self.context.get("request")
        user = getattr(request, "user", None) if request else None
        if not user or not getattr(user, "is_authenticated", False):
            return False
        from apps.subscriptions.services import has_active_premium

        return has_active_premium(user)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if data["locked"]:
            data["source_url"] = None
            data["embed_url"] = None
        return data


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
