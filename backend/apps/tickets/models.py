import uuid

from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel
from apps.payments.models import Currency


class TicketType(TimeStampedModel):
    """A sellable tier for an event (e.g. General Admission, Ringside).
    `price` here is the server-side source of truth an Order's total is
    calculated from — a client never supplies its own price (spec §15)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey("events.Event", on_delete=models.CASCADE, related_name="ticket_types")
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, choices=Currency.choices, default=Currency.USD)
    quantity_total = models.PositiveIntegerField()
    quantity_sold = models.PositiveIntegerField(default=0)

    @property
    def is_sold_out(self):
        return self.quantity_sold >= self.quantity_total


class TicketStatus(models.TextChoices):
    VALID = "VALID", "Valid"
    USED = "USED", "Used"
    CANCELED = "CANCELED", "Canceled"
    REFUNDED = "REFUNDED", "Refunded"


class Ticket(TimeStampedModel):
    """The ticket token is an HMAC-signed value (see services.py), not a
    guessable sequential id — a client cannot forge one by editing
    frontend data (spec §13)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_item = models.ForeignKey("orders.OrderItem", on_delete=models.PROTECT, related_name="tickets")
    ticket_type = models.ForeignKey(TicketType, on_delete=models.PROTECT, related_name="tickets")
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="tickets")

    signed_token = models.CharField(max_length=512, unique=True)
    status = models.CharField(max_length=15, choices=TicketStatus.choices, default=TicketStatus.VALID)

    scanned_at = models.DateTimeField(null=True, blank=True)
    scanned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="tickets_scanned"
    )

    class Meta:
        indexes = [models.Index(fields=["owner", "status"])]
