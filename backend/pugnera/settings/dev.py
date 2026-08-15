"""Local development settings. Never used in production."""
from .base import *  # noqa: F401,F403

DEBUG = env.bool("DJANGO_DEBUG", default=True)  # noqa: F405
SECRET_KEY = env("DJANGO_SECRET_KEY", default="dev-insecure-key-do-not-use-in-production")  # noqa: F405
ALLOWED_HOSTS = ["*"]

SIMPLE_JWT["SIGNING_KEY"] = env(  # noqa: F405
    "JWT_SIGNING_KEY", default="dev-insecure-jwt-signing-key-do-not-use-in-production"
)

# Local dev can use console email + local filesystem storage instead of S3/R2
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
STORAGES["default"]["BACKEND"] = "django.core.files.storage.FileSystemStorage"  # noqa: F405

CORS_ALLOWED_ORIGINS = env.list(  # noqa: F405
    "CORS_ALLOWED_ORIGINS", default=["http://localhost:3000"]
)
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=["http://localhost:3000"])  # noqa: F405

SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
