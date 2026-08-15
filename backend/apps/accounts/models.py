import uuid
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.core.validators import RegexValidator
from django.db import models
from django.utils import timezone

from apps.core.models import TimeStampedModel, UUIDModel
from .managers import UserManager

phone_validator = RegexValidator(
    regex=r"^\+?[1-9]\d{6,14}$",
    message="Enter a valid phone number in international format, e.g. +263771234567.",
)


class Role(models.TextChoices):
    """Every sensitive endpoint checks this server-side value — never a
    client-supplied role (PUGNERA spec §14)."""

    FAN = "FAN", "Fan"
    BOXER = "BOXER", "Boxer"
    COACH = "COACH", "Coach"
    PROMOTER = "PROMOTER", "Promoter"
    MEDIA = "MEDIA", "Media"
    MODERATOR = "MODERATOR", "Moderator"
    EDITOR = "EDITOR", "Editor"
    FINANCE = "FINANCE", "Finance"
    ADMIN = "ADMIN", "Admin"
    SUPERADMIN = "SUPERADMIN", "Super Admin"


# A user registers as one of these; staff/finance/moderation roles are
# assigned later through an authorized backend process (spec §1, §13).
SELF_REGISTERABLE_ROLES = {Role.FAN, Role.BOXER}


class User(AbstractBaseUser, PermissionsMixin, UUIDModel, TimeStampedModel):
    """Common authentication/account info only. Role-specific data lives in
    BoxerProfile / FanProfile (spec §15) so this table stays small and the
    domain model stays clean.
    """

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=20, blank=True, validators=[phone_validator])
    date_of_birth = models.DateField(null=True, blank=True)
    country = models.CharField(max_length=2, blank=True, help_text="ISO 3166-1 alpha-2")
    city = models.CharField(max_length=120, blank=True)

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.FAN)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    class Meta:
        indexes = [models.Index(fields=["role"])]

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


class BoxerProfile(TimeStampedModel):
    class VerificationStatus(models.TextChoices):
        UNVERIFIED = "UNVERIFIED", "Unverified"
        PENDING = "PENDING_VERIFICATION", "Pending verification"
        VERIFIED = "VERIFIED", "Verified"

    class Stance(models.TextChoices):
        ORTHODOX = "ORTHODOX", "Orthodox"
        SOUTHPAW = "SOUTHPAW", "Southpaw"
        SWITCH = "SWITCH", "Switch"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="boxer_profile")

    gym = models.CharField(max_length=150, blank=True)
    coach_name = models.CharField(max_length=150, blank=True)
    organization = models.CharField(max_length=150, blank=True)
    is_professional = models.BooleanField(default=False)
    weight_class = models.CharField(max_length=50, blank=True)
    current_weight_kg = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    height_cm = models.PositiveSmallIntegerField(null=True, blank=True)
    reach_cm = models.PositiveSmallIntegerField(null=True, blank=True)
    stance = models.CharField(max_length=10, choices=Stance.choices, blank=True)
    years_boxing = models.PositiveSmallIntegerField(null=True, blank=True)

    wins = models.PositiveIntegerField(default=0)
    losses = models.PositiveIntegerField(default=0)
    draws = models.PositiveIntegerField(default=0)
    knockouts = models.PositiveIntegerField(default=0)

    biography = models.TextField(blank=True)
    social_links = models.JSONField(default=dict, blank=True)
    profile_image_key = models.CharField(max_length=255, blank=True)

    # A boxer can never set this themselves — only an authorized backend
    # verification workflow may change it (spec §9).
    verification_status = models.CharField(
        max_length=25, choices=VerificationStatus.choices, default=VerificationStatus.UNVERIFIED
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="verifications_performed"
    )

    class Meta:
        indexes = [models.Index(fields=["verification_status"]), models.Index(fields=["weight_class"])]

    @property
    def total_fights(self):
        return self.wins + self.losses + self.draws


class FanProfile(TimeStampedModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="fan_profile")
    profile_image_key = models.CharField(max_length=255, blank=True)

    favorite_fighter_ids = models.JSONField(default=list, blank=True)
    favorite_organization = models.CharField(max_length=150, blank=True)
    favorite_weight_class = models.CharField(max_length=50, blank=True)
    favorite_event_ids = models.JSONField(default=list, blank=True)


class DeviceSession(TimeStampedModel):
    """One row per issued refresh token / logged-in device, so users can
    view active sessions and log out of all devices (spec §11)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sessions")
    refresh_token_jti = models.CharField(max_length=255, unique=True)
    device_label = models.CharField(max_length=255, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=512, blank=True)
    last_seen_at = models.DateTimeField(auto_now=True)
    revoked_at = models.DateTimeField(null=True, blank=True)

    @property
    def is_active(self):
        return self.revoked_at is None

    def revoke(self):
        self.revoked_at = timezone.now()
        self.save(update_fields=["revoked_at"])


class EmailVerificationToken(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="email_tokens")
    consumed_at = models.DateTimeField(null=True, blank=True)

    def is_valid(self):
        from django.conf import settings as dj_settings

        ttl = timedelta(hours=dj_settings.EMAIL_VERIFICATION_TOKEN_TTL_HOURS)
        return self.consumed_at is None and timezone.now() - self.created_at < ttl


class PasswordResetToken(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="password_reset_tokens")
    consumed_at = models.DateTimeField(null=True, blank=True)

    def is_valid(self):
        from django.conf import settings as dj_settings

        ttl = timedelta(minutes=dj_settings.PASSWORD_RESET_TOKEN_TTL_MINUTES)
        return self.consumed_at is None and timezone.now() - self.created_at < ttl


class AccountDeletionRequest(TimeStampedModel):
    """Deletion is a request, not an immediate hard delete — active
    subscriptions/financial records must be handled first (spec §12)."""

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="deletion_requests")
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.PENDING)
    reason = models.TextField(blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
