from django.contrib import admin

from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ["title", "date", "venue", "city", "status", "is_ppv"]
    list_filter = ["status", "is_ppv"]
    search_fields = ["title", "venue", "city"]
