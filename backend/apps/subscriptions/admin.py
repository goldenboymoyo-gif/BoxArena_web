from django.contrib import admin

from .models import Plan, Subscription


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ["tier", "billing_interval", "price", "currency", "is_active"]


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ["user", "plan", "status", "current_period_end"]
    list_filter = ["status"]

    def has_delete_permission(self, request, obj=None):
        return False
