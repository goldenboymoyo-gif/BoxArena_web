from axes.signals import user_locked_out
from django.contrib.auth.signals import user_login_failed
from django.dispatch import receiver

from apps.audit.services import record_audit_event


@receiver(user_login_failed)
def on_login_failed(sender, credentials, request=None, **kwargs):
    ip = request.META.get("REMOTE_ADDR") if request else None
    record_audit_event(
        action="account.login_failed",
        actor_label=str(credentials.get("username", "unknown")),
        result="failure",
        ip_address=ip,
    )


@receiver(user_locked_out)
def on_user_locked_out(sender, request, username, ip_address, **kwargs):
    # Suspicious-login detection: repeated failures tripped the axes lockout.
    record_audit_event(
        action="account.locked_out",
        actor_label=str(username),
        result="failure",
        ip_address=ip_address,
        metadata={"reason": "too_many_failed_attempts"},
    )
