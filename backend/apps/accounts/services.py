"""Business logic kept out of views (spec §2)."""
import logging

from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken

from apps.audit.services import record_audit_event

from .models import DeviceSession, EmailVerificationToken, PasswordResetToken

logger = logging.getLogger("django")


def issue_email_verification(user):
    from .tasks import send_verification_email

    token = EmailVerificationToken.objects.create(user=user)
    send_verification_email.delay(user.email, str(token.id))
    return token


def consume_email_verification(token_id) -> bool:
    try:
        token = EmailVerificationToken.objects.select_related("user").get(id=token_id)
    except (EmailVerificationToken.DoesNotExist, ValueError, TypeError):
        return False
    if not token.is_valid():
        return False
    token.consumed_at = timezone.now()
    token.save(update_fields=["consumed_at"])
    user = token.user
    user.is_email_verified = True
    user.save(update_fields=["is_email_verified"])
    record_audit_event(action="account.email_verified", actor=user, object_type="user", object_id=user.id)
    return True


def issue_password_reset(user):
    from .tasks import send_password_reset_email

    token = PasswordResetToken.objects.create(user=user)
    send_password_reset_email.delay(user.email, str(token.id))
    return token


def consume_password_reset(token_id, new_password) -> bool:
    try:
        token = PasswordResetToken.objects.select_related("user").get(id=token_id)
    except (PasswordResetToken.DoesNotExist, ValueError, TypeError):
        return False
    if not token.is_valid():
        return False
    user = token.user
    user.set_password(new_password)
    user.save(update_fields=["password"])
    token.consumed_at = timezone.now()
    token.save(update_fields=["consumed_at"])
    # Reset password => treat as a security event: revoke every existing session.
    revoke_all_sessions(user)
    record_audit_event(action="account.password_reset", actor=user, object_type="user", object_id=user.id)
    return True


def issue_tokens_for_user(user, *, ip_address="", user_agent="", device_label=""):
    refresh = RefreshToken.for_user(user)
    refresh["role"] = user.role
    jti = refresh.payload.get("jti")
    DeviceSession.objects.create(
        user=user,
        refresh_token_jti=jti,
        ip_address=ip_address or None,
        user_agent=user_agent[:512],
        device_label=device_label or user_agent[:255],
    )
    record_audit_event(
        action="account.login", actor=user, object_type="user", object_id=user.id,
        ip_address=ip_address or None,
    )
    return refresh


def revoke_session_by_jti(jti: str):
    DeviceSession.objects.filter(refresh_token_jti=jti, revoked_at__isnull=True).update(revoked_at=timezone.now())


def revoke_all_sessions(user):
    from rest_framework_simplejwt.token_blacklist.models import OutstandingToken

    DeviceSession.objects.filter(user=user, revoked_at__isnull=True).update(revoked_at=timezone.now())
    for outstanding in OutstandingToken.objects.filter(user=user):
        from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

        BlacklistedToken.objects.get_or_create(token=outstanding)


def execute_account_deletion(deletion_request_id):
    """Anonymize PII, revoke sessions, but preserve financial records that
    must legally/operationally be retained (spec §12). Orders/payments keep
    a foreign key to a now-anonymized user row rather than being deleted.
    """
    from .models import AccountDeletionRequest

    try:
        req = AccountDeletionRequest.objects.select_related("user").get(id=deletion_request_id)
    except AccountDeletionRequest.DoesNotExist:
        return

    user = req.user
    revoke_all_sessions(user)

    user.email = f"deleted-user-{user.id}@pugnera.invalid"
    user.first_name = "Deleted"
    user.last_name = "User"
    user.phone_number = ""
    user.is_active = False
    user.set_unusable_password()
    user.save()

    req.status = AccountDeletionRequest.Status.COMPLETED
    req.processed_at = timezone.now()
    req.save(update_fields=["status", "processed_at"])

    record_audit_event(action="account.deleted", actor_label="system", object_type="user", object_id=user.id)
