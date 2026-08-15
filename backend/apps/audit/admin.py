from django.contrib import admin

from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "action", "actor", "object_type", "object_id", "result")
    list_filter = ("action", "result")
    search_fields = ("actor__email", "object_type", "object_id")
    readonly_fields = [f.name for f in AuditLog._meta.fields]

    def has_add_permission(self, request):
        return False  # append-only via record_audit_event(), never via admin

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser  # legal/GDPR erasure only, exceptional
