from django.contrib.auth import password_validation
from rest_framework import serializers

from .models import BoxerProfile, FanProfile, Role, User


class BoxerProfileInputSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoxerProfile
        fields = [
            "gym", "coach_name", "organization", "is_professional", "weight_class",
            "current_weight_kg", "height_cm", "reach_cm", "stance", "years_boxing",
            "wins", "losses", "draws", "knockouts", "biography", "social_links",
            "highlight_video_url",
        ]


class FanProfileInputSerializer(serializers.ModelSerializer):
    class Meta:
        model = FanProfile
        fields = [
            "favorite_fighter_ids", "favorite_organization",
            "favorite_weight_class", "favorite_event_ids",
        ]


class RegisterSerializer(serializers.ModelSerializer):
    """Handles both BOXER and FAN registration (spec §1-3). `role` is
    restricted to self-registerable roles only — a client can never
    register as ADMIN/MODERATOR/etc. by sending that value (spec §14).
    """

    password = serializers.CharField(write_only=True, min_length=10)
    role = serializers.ChoiceField(choices=[(r.value, r.label) for r in Role])
    boxer_profile = BoxerProfileInputSerializer(required=False)
    fan_profile = FanProfileInputSerializer(required=False)

    class Meta:
        model = User
        fields = [
            "email", "password", "first_name", "last_name", "phone_number",
            "date_of_birth", "country", "city", "role", "boxer_profile", "fan_profile",
        ]

    def validate_role(self, value):
        from .models import SELF_REGISTERABLE_ROLES

        if value not in {r.value for r in SELF_REGISTERABLE_ROLES}:
            raise serializers.ValidationError("Invalid account type.")
        return value

    def validate_password(self, value):
        password_validation.validate_password(value)
        return value

    def validate(self, attrs):
        role = attrs.get("role")
        if role == Role.BOXER and not attrs.get("boxer_profile"):
            raise serializers.ValidationError({"boxer_profile": "Boxer details are required."})
        return attrs

    def create(self, validated_data):
        boxer_data = validated_data.pop("boxer_profile", None)
        fan_data = validated_data.pop("fan_profile", None)
        password = validated_data.pop("password")
        role = validated_data["role"]

        user = User(**validated_data, is_email_verified=False)
        user.set_password(password)
        user.full_clean(exclude=["password"])
        user.save()

        if role == Role.BOXER:
            BoxerProfile.objects.create(user=user, **(boxer_data or {}))
        else:
            FanProfile.objects.create(user=user, **(fan_data or {}))
        return user


class BoxerProfilePublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoxerProfile
        fields = [
            "gym", "coach_name", "organization", "is_professional", "weight_class",
            "current_weight_kg", "height_cm", "reach_cm", "stance", "years_boxing",
            "wins", "losses", "draws", "knockouts", "biography", "social_links",
            "verification_status", "profile_image_key", "highlight_video_url",
        ]
        read_only_fields = ["verification_status"]


class FanProfilePublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = FanProfile
        fields = [
            "favorite_fighter_ids", "favorite_organization",
            "favorite_weight_class", "favorite_event_ids", "profile_image_key",
        ]


class MeSerializer(serializers.ModelSerializer):
    """What a user sees about themselves. Excludes password hash, tokens,
    and other private fields by construction — never serialize `.password`
    or raw auth tokens (spec §7)."""

    boxer_profile = BoxerProfilePublicSerializer(read_only=True)
    fan_profile = FanProfilePublicSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id", "email", "first_name", "last_name", "phone_number",
            "date_of_birth", "country", "city", "role", "is_email_verified",
            "boxer_profile", "fan_profile", "created_at",
        ]
        read_only_fields = ["id", "email", "role", "is_email_verified", "created_at"]


class UpdateMeSerializer(serializers.ModelSerializer):
    """Ownership is enforced at the view level (request.user only, never an
    id from the URL/body) — see apps/accounts/views.py MeView."""

    class Meta:
        model = User
        fields = ["first_name", "last_name", "phone_number", "date_of_birth", "country", "city"]


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=10)

    def validate_new_password(self, value):
        password_validation.validate_password(value)
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    new_password = serializers.CharField(write_only=True, min_length=10)

    def validate_new_password(self, value):
        password_validation.validate_password(value)
        return value


class DeviceSessionSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    device_label = serializers.CharField(read_only=True)
    ip_address = serializers.IPAddressField(read_only=True)
    user_agent = serializers.CharField(read_only=True)
    last_seen_at = serializers.DateTimeField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)


class AccountDeletionRequestSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)
