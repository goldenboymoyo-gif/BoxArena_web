from django.contrib import admin

from .models import Ticket, TicketType


@admin.register(TicketType)
class TicketTypeAdmin(admin.ModelAdmin):
    list_display = ["name", "event", "price", "currency", "quantity_sold", "quantity_total"]


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ["id", "owner", "ticket_type", "status", "scanned_at"]
    list_filter = ["status"]
    readonly_fields = ["signed_token"]

    def has_delete_permission(self, request, obj=None):
        return False
