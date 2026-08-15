"""
Server-side chat rules (spec §26). The websocket consumer (apps.live) is a
thin transport layer — all validation/moderation logic lives here so it's
testable without a live socket connection.
"""
import uuid

from django.core.cache import cache
from django.db import transaction

from apps.audit.services import record_audit_event

from .models import MAX_MESSAGE_LENGTH, ChatBlock, ChatMessage, ChatReport

RATE_LIMIT_WINDOW_SECONDS = 5  # 1 message per window per user per room


class ChatError(Exception):
    pass


def _rate_limit_key(user_id, room):
    return f"chat:rl:{room}:{user_id}"


def can_send(user, room: str) -> bool:
    key = _rate_limit_key(user.id, room)
    if cache.get(key):
        return False
    cache.set(key, True, timeout=RATE_LIMIT_WINDOW_SECONDS)
    return True


@transaction.atomic
def send_message(*, user, room: str, text: str) -> ChatMessage:
    text = (text or "").strip()
    if not text:
        raise ChatError("Message cannot be empty.")
    if len(text) > MAX_MESSAGE_LENGTH:
        raise ChatError(f"Message exceeds {MAX_MESSAGE_LENGTH} characters.")
    if not can_send(user, room):
        raise ChatError("You're sending messages too fast. Please slow down.")

    # Impersonation prevention (spec §26): "mod" status is derived from
    # user.role server-side when the message is broadcast — a client can
    # never set it on the message itself, because there's no such field
    # to set. See apps.live.consumers for how this is rendered.
    message = ChatMessage.objects.create(id=uuid.uuid4(), room=room, author=user, text=text)
    return message


def block_user(*, blocker, blocked_id) -> ChatBlock:
    block, _ = ChatBlock.objects.get_or_create(blocker=blocker, blocked_id=blocked_id)
    return block


def unblock_user(*, blocker, blocked_id):
    ChatBlock.objects.filter(blocker=blocker, blocked_id=blocked_id).delete()


def blocked_user_ids(user) -> set:
    return set(ChatBlock.objects.filter(blocker=user).values_list("blocked_id", flat=True))


def report_message(*, message: ChatMessage, reported_by, reason: str) -> ChatReport:
    report = ChatReport.objects.create(message=message, reported_by=reported_by, reason=reason)
    record_audit_event(
        action="chat.message_reported", actor=reported_by, object_type="chat_message", object_id=message.id,
        metadata={"reason": reason},
    )
    return report


def hide_message(*, message: ChatMessage, moderator, reason: str):
    """Moderator-only content removal (spec §26) — never available to an
    ordinary user via the same endpoint used to send messages."""
    message.is_hidden = True
    message.hidden_reason = reason
    message.save(update_fields=["is_hidden", "hidden_reason"])
    record_audit_event(
        action="chat.message_hidden", actor=moderator, object_type="chat_message", object_id=message.id,
        metadata={"reason": reason},
    )
    return message
