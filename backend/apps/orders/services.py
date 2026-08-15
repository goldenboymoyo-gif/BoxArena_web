from django.db import transaction
from django.utils import timezone

from apps.audit.services import record_audit_event

from .models import OrderStatus


@transaction.atomic
def mark_order_paid(order):
    """Called only from apps.payments.services after a verified webhook
    confirms SUCCEEDED status (spec §11, §35) — never directly from a
    client request."""
    if order.status == OrderStatus.PAID:
        return order  # idempotent: duplicate webhook must not double-grant
    order.status = OrderStatus.PAID
    order.paid_at = timezone.now()
    order.save(update_fields=["status", "paid_at"])

    if order.order_type == "TICKET":
        from apps.tickets.services import issue_tickets_for_order

        issue_tickets_for_order(order)

    record_audit_event(action="order.paid", actor=order.user, object_type="order", object_id=order.id)
    return order
