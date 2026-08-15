from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import (
    AccountDeletionRequest,
    BoxerProfile,
    DeviceSession,
    FanProfile,
    User,
)


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    """Least-privilege admin: role changes are a distinct, logged action —
    an ordinary staff member does not get blanket superuser access just by
    being staff (spec §13, §18)."""

    ordering = ["email"]
    list_display = ["email", "full_name", "role", "is_active", "is_email_verified", "is_staff"]
    list_filter = ["role", "is_active", "is_staff", "is_email_verified"]
    search_fields = ["email", "first_name", "last_name"]
    readonly_fields = ["id", "created_at", "updated_at", "last_login"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name", "phone_number", "date_of_birth", "country", "city")}),
        ("Role & status", {"fields": ("role", "is_active", "is_staff", "is_superuser", "is_email_verified")}),
        ("Permissions", {"fields": ("groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "created_at", "updated_at")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "first_name", "last_name", "role", "password1", "password2")}),
    )

    def has_delete_permission(self, request, obj=None):
        # Users are deleted through the account-deletion workflow (which
        # preserves financial records), never a raw admin delete.
        return False


@admin.register(BoxerProfile)
class BoxerProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "weight_class", "verification_status", "wins", "losses", "draws"]
    list_filter = ["verification_status", "weight_class", "is_professional"]
    search_fields = ["user__email", "gym", "coach_name"]
    readonly_fields = ["verified_at", "verified_by"]
    actions = ["mark_verified"]

    @admin.action(description="Mark selected boxers as VERIFIED")
    def mark_verified(self, request, queryset):
        from django.utils import timezone

        from apps.audit.services import record_audit_event

        for profile in queryset:
            profile.verification_status = BoxerProfile.VerificationStatus.VERIFIED
            profile.verified_at = timezone.now()
            profile.verified_by = request.user
            profile.save(update_fields=["verification_status", "verified_at", "verified_by"])
            record_audit_event(
                action="boxer.verified", actor=request.user, object_type="boxer_profile", object_id=profile.pk
            )


@admin.register(FanProfile)
class FanProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "favorite_organization", "favorite_weight_class"]
    search_fields = ["user__email"]


@admin.register(DeviceSession)
class DeviceSessionAdmin(admin.ModelAdmin):
    list_display = ["user", "device_label", "ip_address", "last_seen_at", "is_active"]
    readonly_fields = [f.name for f in DeviceSession._meta.fields]

    def has_add_permission(self, request):
        return False


@admin.register(AccountDeletionRequest)
class AccountDeletionRequestAdmin(admin.ModelAdmin):
    list_display = ["user", "status", "created_at", "processed_at"]
    list_filter = ["status"]
