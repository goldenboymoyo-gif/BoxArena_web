from django.contrib import admin

from .models import LiveEvent, LiveEventStream, StreamSource


class LiveEventStreamInline(admin.TabularInline):
    model = LiveEventStream
    extra = 0


@admin.register(StreamSource)
class StreamSourceAdmin(admin.ModelAdmin):
    list_display = ["name", "source_type", "tier", "enabled", "verified", "last_polled_at"]
    list_filter = ["source_type", "tier", "enabled", "verified"]
    actions = ["enable_sources", "disable_sources", "verify_sources"]

    @admin.action(description="Enable selected sources")
    def enable_sources(self, request, queryset):
        from .services import set_source_enabled

        for source in queryset:
            set_source_enabled(source, enabled=True, actor=request.user)

    @admin.action(description="Disable selected sources")
    def disable_sources(self, request, queryset):
        from .services import set_source_enabled

        for source in queryset:
            set_source_enabled(source, enabled=False, actor=request.user)

    @admin.action(description="Mark selected sources as verified")
    def verify_sources(self, request, queryset):
        from .services import set_source_verified

        for source in queryset:
            set_source_verified(source, verified=True, actor=request.user)


@admin.register(LiveEvent)
class LiveEventAdmin(admin.ModelAdmin):
    list_display = ["title", "fighter_1", "fighter_2", "status", "is_free", "is_verified", "start_time"]
    list_filter = ["status", "is_free", "is_verified"]
    search_fields = ["fighter_1", "fighter_2", "organization"]
    inlines = [LiveEventStreamInline]
