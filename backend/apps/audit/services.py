import logging

logger = logging.getLogger("pugnera.audit")

_SENSITIVE_KEYS = {
    "password", "token", "secret", "cvv", "cvc", "card_number", "pan",
    "access_token", "refresh_token", "authorization", "signing_key", "api_key",
}


def _scrub(metadata: dict) -> dict:
    return {k: ("***REDACTED***" if k.lower() in _SENSITIVE_KEYS else v) for k, v in (metadata or {}).items()}


def record_audit_event(
    *,
    action: str,
    actor=None,
    actor_label: str = "",
    object_type: str = "",
    object_id: str = "",
    result: str = "success",
    ip_address: str = None,
    request_id: str = "",
    metadata: dict = None,
):
    """Central write path for the audit trail. Import lazily to avoid a hard
    app-loading-order dependency between audit and every other app that
    reports events to it."""
    from .models import AuditLog

    clean_metadata = _scrub(metadata or {})
    entry = AuditLog.objects.create(
        actor=actor if getattr(actor, "is_authenticated", False) else None,
        actor_label=actor_label or (str(actor) if actor and not getattr(actor, "is_authenticated", True) else ""),
        action=action,
        object_type=object_type,
        object_id=str(object_id) if object_id else "",
        result=result,
        ip_address=ip_address,
        request_id=request_id,
        metadata=clean_metadata,
    )
    logger.info("audit_event", extra={"action": action, "actor_id": getattr(actor, "id", None), "status": result})
    return entry
