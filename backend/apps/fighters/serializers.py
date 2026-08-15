from rest_framework import serializers

from .models import Fighter


class FighterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fighter
        fields = [
            "id", "full_name", "nickname", "country", "weight_class", "stance",
            "wins", "losses", "draws", "knockouts", "ranking", "is_p4p",
            "profile_image_key", "biography",
        ]
        read_only_fields = fields
