"""
Signed ticket tokens (spec §13). Each ticket's QR payload is an HMAC-signed
token over (ticket_id, event_id, owner_id) using JWT_SIGNING_KEY — a user
cannot forge a valid ticket by editing frontend state, because they cannot
produce a signature without the server's key.
"""
import hashlib
import hmac
import uuid

from django.conf import settings
from django.db import transaction

from apps.audit.services import record_audit_event

from .models import Ticket, TicketStatus, TicketType


def _sign(ticket_id, event_id, owner_id) -> str:
    message = f"{ticket_id}:{event_id}:{owner_id}".encode()
    key = settings.SIMPLE_JWT["SIGNING_KEY"].encode()
    return hmac.new(key, message, hashlib.sha256).hexdigest()


def build_ticket_token(ticket: Ticket) -> str:
    signature = _sign(ticket.id, ticket.ticket_type.event_id, ticket.owner_id)
    return f"{ticket.id}.{signature}"


def verify_ticket_token(token: str) -> Ticket | None:
    try:
        ticket_id, signature = token.split(".", 1)
        ticket = Ticket.objects.select_related("ticket_type").get(id=ticket_id)
    except (ValueError, Ticket.DoesNotExist):
        return None
    expected = _sign(ticket.id, ticket.ticket_type.event_id, ticket.owner_id)
    if not hmac.compare_digest(signature, expected):
        return None
    return ticket


@transaction.atomic
def issue_tickets_for_order(order):
    """Called only after apps.orders.services.mark_order_paid confirms a
    verified, paid order — never speculatively before payment (spec §13)."""
    for item in order.items.select_related("ticket_type").filter(ticket_type__isnull=False):
        ticket_type = TicketType.objects.select_for_update().get(id=item.ticket_type_id)
        for _ in range(item.quantity):
            if ticket_type.quantity_sold >= ticket_type.quantity_total:
                # Oversold protection: reject silently-impossible extra
                # tickets rather than issuing more than were available.
                record_audit_event(
                    action="ticket.oversold_attempt", actor=order.user, object_type="ticket_type",
                    object_id=ticket_type.id, result="failure",
                )
                break
            ticket = Ticket.objects.create(
                id=uuid.uuid4(),
                order_item=item,
                ticket_type=ticket_type,
                owner=order.user,
                signed_token="",
            )
            ticket.signed_token = build_ticket_token(ticket)
            ticket.save(update_fields=["signed_token"])
            ticket_type.quantity_sold += 1
            ticket_type.save(update_fields=["quantity_sold"])
            record_audit_event(
                action="ticket.issued", actor=order.user, object_type="ticket", object_id=ticket.id,
                metadata={"order_id": str(order.id)},
            )


@transaction.atomic
def scan_ticket(token: str, *, scanned_by):
    """Duplicate-scan protection: a VALID ticket transitions to USED
    exactly once, inside a row lock, so two simultaneous scans of the same
    QR code cannot both succeed (spec §13)."""
    ticket = verify_ticket_token(token)
    if ticket is None:
        return None, "invalid_token"

    ticket = Ticket.objects.select_for_update().get(id=ticket.id)
    if ticket.status == TicketStatus.USED:
        return ticket, "already_used"
    if ticket.status != TicketStatus.VALID:
        return ticket, "not_valid"

    from django.utils import timezone

    ticket.status = TicketStatus.USED
    ticket.scanned_at = timezone.now()
    ticket.scanned_by = scanned_by
    ticket.save(update_fields=["status", "scanned_at", "scanned_by"])
    record_audit_event(
        action="ticket.scanned", actor=scanned_by, object_type="ticket", object_id=ticket.id,
    )
    return ticket, "accepted"
