import uuid

from django.db import models

from apps.core.models import TimeStampedModel


class VerificationStatus(models.TextChoices):
    UNVERIFIED = "UNVERIFIED", "Unverified"
    PENDING = "PENDING_VERIFICATION", "Pending verification"
    VERIFIED = "VERIFIED", "Verified"


class Organization(TimeStampedModel):
    """A sanctioning body/federation (e.g. WBC, IBA). Verification is an
    authorized-staff-only action (spec: "PUGNERA — USER REGISTRATION..."
    §9 extends the same principle to organizations, not just boxers)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150, unique=True)
    country = models.CharField(max_length=2, blank=True)
    website_url = models.URLField(blank=True)
    verification_status = models.CharField(
        max_length=25, choices=VerificationStatus.choices, default=VerificationStatus.UNVERIFIED
    )

    def __str__(self):
        return self.name


class Gym(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    country = models.CharField(max_length=2, blank=True)
    city = models.CharField(max_length=120, blank=True)
    verification_status = models.CharField(
        max_length=25, choices=VerificationStatus.choices, default=VerificationStatus.UNVERIFIED
    )

    def __str__(self):
        return self.name
