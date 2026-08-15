from rest_framework import serializers

from .models import Event


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "id", "title", "headline", "date", "time", "timezone", "venue", "city",
            "status", "is_ppv", "poster_image_key",
        ]
        read_only_fields = fields
