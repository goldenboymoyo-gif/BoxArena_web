"""
Orders exist to pin down a *server-calculated* price at a point in time
(spec §15, §35). A PaymentIntent always references an Order, never a raw
client-supplied amount.
"""
import uuid

from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel
from apps.payments.models import Currency


class OrderType(models.TextChoices):
    TICKET = "TICKET", "Event ticket"
    PPV = "PPV", "Pay-per-view"
    SUBSCRIPTION = "SUBSCRIPTION", "Subscription"


class OrderStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    PAID = "PAID", "Paid"
    CANCELED = "CANCELED", "Canceled"
    REFUNDED = "REFUNDED", "Refunded"
    FAILED = "FAILED", "Failed"


class Order(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="orders")
    order_type = models.CharField(max_length=20, choices=OrderType.choices)
    status = models.CharField(max_length=20, choices=OrderStatus.choices, default=OrderStatus.PENDING)

    # The authoritative price. Computed server-side from OrderItem rows /
    # the referenced product (ticket type, PPV event, plan) — never copied
    # from a client-supplied "price" field.
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, choices=Currency.choices, default=Currency.USD)

    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["user", "status"])]

    def recalculate_total(self):
        total = sum((item.line_total for item in self.items.all()), start=0)
        self.total_amount = total
        self.save(update_fields=["total_amount"])
        return total


class OrderItem(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")

    description = models.CharField(max_length=255)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)

    ticket_type = models.ForeignKey(
        "tickets.TicketType", null=True, blank=True, on_delete=models.PROTECT, related_name="order_items"
    )

    @property
    def line_total(self):
        return self.unit_price * self.quantity
