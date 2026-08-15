from django.contrib import admin

from .models import (
    PaymentIntent,
    PaymentMethod,
    PaymentProviderConfig,
    PaymentTransaction,
    Refund,
    WebhookEvent,
)


@admin.register(PaymentProviderConfig)
class PaymentProviderConfigAdmin(admin.ModelAdmin):
    list_display = ["key", "display_name", "enabled", "is_live", "supports_refunds", "supports_recurring"]
    list_filter = ["enabled", "is_live"]


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ["user", "provider", "method_type", "card_brand", "last4"]
    readonly_fields = ["provider_payment_method_token"]


@admin.register(PaymentIntent)
class PaymentIntentAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "amount", "currency", "status", "created_at"]
    list_filter = ["status", "currency"]
    readonly_fields = [f.name for f in PaymentIntent._meta.fields]

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ["id", "intent", "amount", "currency", "status", "created_at"]
    list_filter = ["status", "currency"]
    readonly_fields = [f.name for f in PaymentTransaction._meta.fields]

    def has_add_permission(self, request):
        return False  # created only via webhook processing

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ["id", "transaction", "amount", "status", "requested_by", "approved_by"]
    list_filter = ["status"]


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    list_display = ["provider", "event_type", "signature_valid", "processing_result", "created_at"]
    list_filter = ["provider", "event_type", "processing_result"]
    readonly_fields = [f.name for f in WebhookEvent._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
