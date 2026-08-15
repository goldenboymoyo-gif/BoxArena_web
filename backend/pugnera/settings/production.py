"""
Production settings.

Every secret MUST come from the environment / secret manager. This module
fails loudly at import time if a required secret is missing, rather than
silently falling back to an insecure default.
"""
from .base import *  # noqa: F401,F403


def _require(name: str) -> str:
    value = env(name, default=None)  # noqa: F405
    if not value:
        raise RuntimeError(
            f"Missing required production secret: {name}. Refusing to start."
        )
    return value


DEBUG = False
SECRET_KEY = _require("DJANGO_SECRET_KEY")
SIMPLE_JWT["SIGNING_KEY"] = _require("JWT_SIGNING_KEY")  # noqa: F405

ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=[])  # noqa: F405
if not ALLOWED_HOSTS:
    raise RuntimeError("DJANGO_ALLOWED_HOSTS must be set in production.")

CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])  # noqa: F405
if not CORS_ALLOWED_ORIGINS:
    raise RuntimeError("CORS_ALLOWED_ORIGINS must be set explicitly in production.")

# --- Transport security -----------------------------------------------------
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = "Strict"
CSRF_COOKIE_SAMESITE = "Strict"

SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "same-origin"
X_FRAME_OPTIONS = "DENY"

# --- Admin MFA is mandatory in production, no opt-out (spec §18) ----------
ADMIN_MFA_REQUIRED = True

# --- Payments: refuse to boot on a non-mock provider without live creds ----
if ACTIVE_PAYMENT_PROVIDER != "mock" and not env("PAYMENT_PROVIDER_SECRET_KEY", default=None):  # noqa: F405
    raise RuntimeError(
        "ACTIVE_PAYMENT_PROVIDER is set to a live provider but "
        "PAYMENT_PROVIDER_SECRET_KEY is missing. Refusing to start."
    )

# --- Sentry ------------------------------------------------------------------
if SENTRY_DSN:  # noqa: F405
    import sentry_sdk
    from sentry_sdk.integrations.celery import CeleryIntegration
    from sentry_sdk.integrations.django import DjangoIntegration
    from sentry_sdk.integrations.redis import RedisIntegration

    sentry_sdk.init(
        dsn=SENTRY_DSN,  # noqa: F405
        integrations=[DjangoIntegration(), CeleryIntegration(), RedisIntegration()],
        traces_sample_rate=0.1,
        send_default_pii=False,  # never send card/PII data to Sentry
        environment=env("ENVIRONMENT_NAME", default="production"),  # noqa: F405
    )
