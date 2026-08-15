from rest_framework import serializers

from .models import Fighter


class FighterSerializer(serializers.ModelSerializer):
    # Populated by the Exists annotation in apps.fighters.services.annotate_boosted
    # (views must use that queryset helper for this to be accurate).
    is_boosted = serializers.BooleanField(read_only=True, default=False)
    highlight_video_url = serializers.SerializerMethodField()

    class Meta:
        model = Fighter
        fields = [
            "id", "full_name", "nickname", "country", "weight_class", "stance",
            "wins", "losses", "draws", "knockouts", "ranking", "is_p4p",
            "profile_image_key", "biography", "is_boosted", "highlight_video_url",
        ]
        read_only_fields = fields

    def get_highlight_video_url(self, obj):
        # Only surfaced for boosted (active-PREMIUM) boxer accounts — the
        # boxer can set this any time via MyBoxerProfileView, but it's only
        # publicly visible while subscribed (gated at read time, not write
        # time, same pattern as apps.streams' subscription-gated streams).
        if not getattr(obj, "is_boosted", False) or not obj.user_id:
            return ""
        boxer_profile = getattr(obj.user, "boxer_profile", None)
        return boxer_profile.highlight_video_url if boxer_profile else ""
