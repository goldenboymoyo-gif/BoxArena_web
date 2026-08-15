import json
import logging
import re

_SENSITIVE_KEYS = re.compile(
    r"(password|token|secret|cvv|cvc|card_number|pan|access_token|refresh_token|"
    r"authorization|signing_key|api_key|webhook_secret)",
    re.IGNORECASE,
)
_CARD_NUMBER = re.compile(r"\b(?:\d[ -]*?){13,19}\b")


def _redact(value):
    if isinstance(value, dict):
        return {
            k: ("***REDACTED***" if _SENSITIVE_KEYS.search(str(k)) else _redact(v))
            for k, v in value.items()
        }
    if isinstance(value, list):
        return [_redact(v) for v in value]
    if isinstance(value, str):
        return _CARD_NUMBER.sub("***REDACTED-CARD***", value)
    return value


class RedactSensitiveDataFilter(logging.Filter):
    """Belt-and-braces filter: even if a bug tries to log a secret, this
    scrubs it before it reaches any log sink (console, Sentry breadcrumbs,
    aggregators). Do not rely on this alone — never log secrets in the
    first place; see PUGNERA spec §19 and §29.
    """

    def filter(self, record):
        if isinstance(record.args, dict):
            record.args = _redact(record.args)
        record.msg = _redact(record.msg) if isinstance(record.msg, (dict, list)) else record.msg
        if hasattr(record, "extra"):
            record.extra = _redact(record.extra)
        return True


class JsonFormatter(logging.Formatter):
    def format(self, record):
        payload = {
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        for key in ("error_id", "actor_id", "action", "status"):
            if hasattr(record, key):
                payload[key] = getattr(record, key)
        return json.dumps(payload, default=str)
