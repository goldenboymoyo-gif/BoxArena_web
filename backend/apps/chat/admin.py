from django.contrib import admin

from .models import ChatBlock, ChatMessage, ChatReport


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ["room", "author", "text", "is_hidden", "created_at"]
    list_filter = ["room", "is_hidden"]
    search_fields = ["author__email", "text"]


@admin.register(ChatReport)
class ChatReportAdmin(admin.ModelAdmin):
    list_display = ["message", "reported_by", "status", "created_at"]
    list_filter = ["status"]
    actions = ["mark_reviewed"]

    @admin.action(description="Mark selected reports as reviewed and hide the message")
    def mark_reviewed(self, request, queryset):
        from .services import hide_message

        for report in queryset:
            hide_message(message=report.message, moderator=request.user, reason=f"Report: {report.reason}")
            report.status = ChatReport.Status.REVIEWED
            report.reviewed_by = request.user
            report.save(update_fields=["status", "reviewed_by"])


@admin.register(ChatBlock)
class ChatBlockAdmin(admin.ModelAdmin):
    list_display = ["blocker", "blocked", "created_at"]
