from django.contrib import admin

from .models import Fight


@admin.register(Fight)
class FightAdmin(admin.ModelAdmin):
    list_display = ["event", "fighter_1", "fighter_2", "is_title_fight", "winner", "result_method"]
    list_filter = ["is_title_fight", "result_method"]
    readonly_fields = ["result_recorded_by", "result_recorded_at"]

    def save_model(self, request, obj, form, change):
        if "winner" in form.changed_data or "result_method" in form.changed_data:
            from django.utils import timezone

            from apps.audit.services import record_audit_event

            obj.result_recorded_by = request.user
            obj.result_recorded_at = timezone.now()
            record_audit_event(action="fight.result_recorded", actor=request.user, object_type="fight", object_id=obj.pk)
        super().save_model(request, obj, form, change)
