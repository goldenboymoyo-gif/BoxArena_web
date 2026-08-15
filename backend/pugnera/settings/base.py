"""
Base settings shared by every environment.

SECURITY NOTE: every secret-bearing value here is read from the environment.
Nothing in this file is a real credential. See ../../.env.example for the
full list of variables an operator must supply.
"""
from datetime import timedelta
from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env()
env_file = BASE_DIR / ".env"
if env_file.exists():
    environ.Env.read_env(str(env_file))

# ---------------------------------------------------------------------------
# Core
# ---------------------------------------------------------------------------
SECRET_KEY = env("DJANGO_SECRET_KEY", default=None)
DEBUG = env.bool("DJANGO_DEBUG", default=False)
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=[])

AUTH_USER_MODEL = "accounts.User"

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # third party
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "django_filters",
    "corsheaders",
    "channels",
    "storages",
    "django_celery_beat",
    "django_celery_results",
    "axes",  # brute-force / account-lockout protection
    "django_otp",  # admin MFA
    "django_otp.plugins.otp_totp",
    # pugnera apps
    "apps.core",
    "apps.accounts",
    "apps.fighters",
    "apps.boxing",
    "apps.events",
    "apps.fights",
    "apps.live",
    "apps.streams",
    "apps.videos",
    "apps.news",
    "apps.subscriptions",
    "apps.payments",
    "apps.orders",
    "apps.tickets",
    "apps.notifications",
    "apps.chat",
    "apps.search",
    "apps.analytics",
    "apps.moderation",
    "apps.audit",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django_otp.middleware.OTPMiddleware",
    "axes.middleware.AxesMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "apps.core.middleware.RequestIdMiddleware",
    "apps.core.middleware.SecurityHeadersMiddleware",
]

ROOT_URLCONF = "pugnera.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        # Checked before any app's own templates dir, so our
        # templates/admin/login.html (adding the OTP field) wins over
        # django.contrib.admin's stock login template without needing to
        # reorder INSTALLED_APPS.
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "pugnera.wsgi.application"
ASGI_APPLICATION = "pugnera.asgi.application"

# ---------------------------------------------------------------------------
# Database (PostgreSQL only — never SQLite in staging/production)
# ---------------------------------------------------------------------------
DATABASES = {
    "default": env.db(
        "DATABASE_URL",
        default="postgres://pugnera:pugnera@localhost:5432/pugnera",
    )
}
DATABASES["default"]["CONN_MAX_AGE"] = 60
DATABASES["default"]["OPTIONS"] = {"sslmode": env("DB_SSL_MODE", default="prefer")}

# ---------------------------------------------------------------------------
# Auth / password validation
# ---------------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 10}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
    {"NAME": "apps.accounts.validators.PasswordComplexityValidator"},
]

AUTHENTICATION_BACKENDS = [
    "axes.backends.AxesBackend",  # must be first: enforces lockouts
    "django.contrib.auth.backends.ModelBackend",
]

# django-axes: brute-force / account lockout protection
AXES_FAILURE_LIMIT = 5
AXES_COOLOFF_TIME = timedelta(minutes=15)
AXES_LOCKOUT_PARAMETERS = ["username", "ip_address"]
AXES_RESET_COOL_OFF_ON_FAILURE_DURING_LOCKOUT = True

# ---------------------------------------------------------------------------
# Internationalization
# ---------------------------------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ---------------------------------------------------------------------------
# Object storage for uploaded media (never store large media in Postgres)
# ---------------------------------------------------------------------------
STORAGES = {
    "default": {
        "BACKEND": "storages.backends.s3.S3Storage",
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}
AWS_STORAGE_BUCKET_NAME = env("MEDIA_BUCKET_NAME", default=None)
AWS_S3_REGION_NAME = env("MEDIA_BUCKET_REGION", default=None)
AWS_S3_ENDPOINT_URL = env("MEDIA_BUCKET_ENDPOINT", default=None)  # e.g. Cloudflare R2 endpoint
AWS_ACCESS_KEY_ID = env("MEDIA_BUCKET_ACCESS_KEY", default=None)
AWS_SECRET_ACCESS_KEY = env("MEDIA_BUCKET_SECRET_KEY", default=None)
AWS_DEFAULT_ACL = None
AWS_QUERYSTRING_AUTH = True
AWS_S3_FILE_OVERWRITE = False
AWS_S3_SIGNATURE_VERSION = "s3v4"

# Uploaded-file limits (defense in depth alongside apps.core.validators)
FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024
PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024
PROFILE_IMAGE_ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"]
PROFILE_IMAGE_MAX_DIMENSION = 4096

# ---------------------------------------------------------------------------
# REST framework
# ---------------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_RENDERER_CLASSES": (
        "rest_framework.renderers.JSONRenderer",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.LimitOffsetPagination",
    "PAGE_SIZE": 20,
    # Every endpoint gets a baseline anon/user rate cap even if it doesn't
    # set a throttle_scope — a view I forgot to scope (or a new one added
    # later) must never end up completely unthrottled. Endpoints that need
    # a tighter, endpoint-specific limit (login, register, payments,
    # refunds, webhooks) additionally set throttle_scope and get the
    # stricter rate from ScopedRedisRateThrottle on top of this baseline.
    "DEFAULT_THROTTLE_CLASSES": (
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
        "apps.core.throttling.ScopedRedisRateThrottle",
    ),
    "DEFAULT_THROTTLE_RATES": {
        "anon": "60/min",
        "user": "300/min",
        "login": "5/min",
        "register": "5/min",
        "password-reset": "3/min",
        "otp": "5/min",
        "payment-create": "10/min",
        "refund-request": "5/min",
        "coupon-validate": "20/min",
        "chat-send": "20/min",
        "webhook": "120/min",
    },
    "EXCEPTION_HANDLER": "apps.core.exceptions.safe_exception_handler",
    "DEFAULT_FILTER_BACKENDS": ("django_filters.rest_framework.DjangoFilterBackend",),
    "TEST_REQUEST_DEFAULT_FORMAT": "json",
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=10),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=14),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": env("JWT_SIGNING_KEY", default=None),
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

# ---------------------------------------------------------------------------
# Redis / Celery / Channels
# ---------------------------------------------------------------------------
REDIS_URL = env("REDIS_URL", default="redis://localhost:6379/0")

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": REDIS_URL,
        "OPTIONS": {"CLIENT_CLASS": "django_redis.client.DefaultClient"},
    }
}

CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = "django-db"
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TASK_ALWAYS_EAGER = env.bool("CELERY_TASK_ALWAYS_EAGER", default=False)

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {"hosts": [REDIS_URL]},
    }
}

# ---------------------------------------------------------------------------
# CORS — explicit allow-list only, never wildcard in any environment
# ---------------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])
# False because this API is Bearer-token (JWT) authenticated, not
# cookie/session authenticated — the browser never needs to send
# credentials (cookies) cross-origin to use it. Leaving this True would
# needlessly widen the CORS attack surface (it permits cross-origin
# requests to include cookies) for no functional benefit. If a future
# feature genuinely needs cookie-based cross-origin requests, turn this on
# deliberately for that case rather than globally.
CORS_ALLOW_CREDENTIALS = False
CORS_ALLOW_ALL_ORIGINS = False

# ---------------------------------------------------------------------------
# Sessions / cookies
# ---------------------------------------------------------------------------
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_HTTPONLY = False  # must be readable by JS to set X-CSRFToken header
CSRF_COOKIE_SAMESITE = "Lax"
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=[])

# ---------------------------------------------------------------------------
# Email (verification / password reset — never log token values)
# ---------------------------------------------------------------------------
EMAIL_BACKEND = env("EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend")
EMAIL_HOST = env("EMAIL_HOST", default=None)
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default=None)
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default=None)
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default="Pugnera <no-reply@pugnera.com>")

EMAIL_VERIFICATION_TOKEN_TTL_HOURS = 24
PASSWORD_RESET_TOKEN_TTL_MINUTES = 30
FRONTEND_URL = env("FRONTEND_URL", default="http://localhost:3000")

# ---------------------------------------------------------------------------
# Admin MFA (spec §18: "Implement... MFA for administrators")
# ---------------------------------------------------------------------------
# When True, apps.core.apps.CoreConfig.ready() requires every staff user to
# have a verified OTP device (django_otp) before the Django admin will let
# them in — see apps/core/apps.py for the enforcement and
# apps/accounts/management/commands/enroll_admin_totp.py for how a staff
# member gets a device in the first place. Off by default in dev so local
# work isn't blocked on setting up TOTP; production.py forces it on.
ADMIN_MFA_REQUIRED = env.bool("ADMIN_MFA_REQUIRED", default=False)

# ---------------------------------------------------------------------------
# Sentry (error + security monitoring) — DSN supplied per-environment
# ---------------------------------------------------------------------------
SENTRY_DSN = env("SENTRY_DSN", default=None)

# ---------------------------------------------------------------------------
# Payments
# ---------------------------------------------------------------------------
# PAYMENT_PROVIDERS maps a provider key to the adapter class implementing
# apps.payments.providers.base.PaymentProviderAdapter. Only the mock adapter
# is registered until a real provider's Zimbabwe availability, PCI posture,
# and API docs have been verified — see backend/README.md ("Payments").
PAYMENT_PROVIDERS = {
    "mock": "apps.payments.providers.mock_provider.MockProviderAdapter",
}
ACTIVE_PAYMENT_PROVIDER = env("ACTIVE_PAYMENT_PROVIDER", default="mock")

# ---------------------------------------------------------------------------
# Logging — never log secrets, tokens, card data, or passwords
# ---------------------------------------------------------------------------
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {
        "redact_sensitive": {"()": "apps.core.logging_filters.RedactSensitiveDataFilter"},
    },
    "formatters": {
        "json": {"()": "apps.core.logging_filters.JsonFormatter"},
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "filters": ["redact_sensitive"],
            "formatter": "json",
        },
    },
    "root": {"handlers": ["console"], "level": "INFO"},
    "loggers": {
        "django": {"handlers": ["console"], "level": "INFO", "propagate": False},
        "pugnera.audit": {"handlers": ["console"], "level": "INFO", "propagate": False},
        "pugnera.payments": {"handlers": ["console"], "level": "INFO", "propagate": False},
    },
}
