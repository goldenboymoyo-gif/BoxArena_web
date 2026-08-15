from django.contrib import admin

from .models import ModerationAction


@admin.register(ModerationAction)
class ModerationActionAdmin(admin.ModelAdmin):
    list_display = ["target_user", "action_type", "moderator", "created_at", "expires_at"]
    list_filter = ["action_type"]

    def has_delete_permission(self, request, obj=None):
        return False
