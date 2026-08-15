"""
Verification-only settings for environments without a running
Postgres/Redis instance (e.g. this sandbox). NEVER used in staging or
production — see pugnera.settings.dev / pugnera.settings.production for
the real environments, which require actual Postgres and Redis.
"""
from .dev import *  # noqa: F401,F403

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "sandbox_test.sqlite3",  # noqa: F405
    }
}

CACHES = {
    "default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"},
}

CELERY_TASK_ALWAYS_EAGER = True
CHANNEL_LAYERS = {"default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}}

# django-axes needs a cache alias named "default" (already set above) and
# works fine against locmem for this verification run.
