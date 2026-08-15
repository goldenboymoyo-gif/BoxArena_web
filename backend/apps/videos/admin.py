from django.contrib import admin

from .models import Video


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ["title", "video_type", "event", "requires_subscription"]
    list_filter = ["video_type", "requires_subscription"]
