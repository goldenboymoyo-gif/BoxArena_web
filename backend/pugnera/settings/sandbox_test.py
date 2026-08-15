"""
Verification-only settings for environments without a running
Postgres/Redis instance (e.g. this sandbox). NEVER used in staging or
production — see pugnera.settings.dev / pugnera.settings.production for
the real environments, which require actual Postgres and Redis.
"""
import pathlib

from .dev import *  # noqa: F401,F403

import tempfile

# The project directory is a OneDrive-synced mount in this environment;
# SQLite's per-transaction fsync/WAL writes there pay real network
# latency on every single test, turning a normal few-second suite into
# minutes (observed: one trivial test taking 40s). Using local disk for
# the throwaway test DB fixes that without changing anything about how
# dev/production actually run (both use real Postgres, unaffected).
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": str(pathlib.Path(tempfile.gettempdir()) / "pugnera_sandbox_test.sqlite3"),
    }
}

CACHES = {
    "default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"},
}

CELERY_TASK_ALWAYS_EAGER = True
CHANNEL_LAYERS = {"default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}}

# django-axes needs a cache alias named "default" (already set above) and
# works fine against locmem for this verification run.
