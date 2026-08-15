from django.db import transaction

from apps.audit.services import record_audit_event

from .models import ModerationAction


@transaction.atomic
def take_action(*, target_user, moderator, action_type: str, reason: str, expires_at=None):
    """Restricted to MODERATOR/ADMIN/SUPERADMIN at the view layer
    (apps.core.permissions.IsModeratorOrAbove) — never callable by an
    ordinary user against themselves or others."""
    action = ModerationAction.objects.create(
        target_user=target_user, moderator=moderator, action_type=action_type, reason=reason, expires_at=expires_at,
    )
    if action_type in {"SUSPEND", "BAN"}:
        target_user.is_active = False
        target_user.save(update_fields=["is_active"])
        # djangorestframework-simplejwt>=5.5.1 already rejects is_active=False
        # users on every authenticated request and on refresh (see
        # PYSEC-2026-1305), so this isn't the only thing standing between a
        # banned user and continued access — but revoking immediately, not
        # just waiting for that check, means there's no window where a
        # still-open device session looks "active" in apps/accounts session
        # listings, and it's consistent with how password reset/change
        # already force full re-authentication.
        from apps.accounts.services import revoke_all_sessions

        revoke_all_sessions(target_user)

    record_audit_event(
        action=f"moderation.{action_type.lower()}", actor=moderator, object_type="user", object_id=target_user.id,
        metadata={"reason": reason},
    )
    return action
