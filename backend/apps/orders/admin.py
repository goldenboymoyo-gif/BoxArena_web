from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["id"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "order_type", "status", "total_amount", "currency", "created_at"]
    list_filter = ["order_type", "status", "currency"]
    inlines = [OrderItemInline]

    def has_delete_permission(self, request, obj=None):
        return False  # financial records are never casually deleted (spec §3)
