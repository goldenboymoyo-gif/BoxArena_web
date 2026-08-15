from celery import shared_task

from .models import StreamSource
from .services import ingest_from_source, reclassify_event_statuses


@shared_task
def poll_all_sources():
    """Scheduled via Celery beat (spec §10: periodic source monitoring)."""
    for source in StreamSource.objects.filter(enabled=True, verified=True):
        ingest_from_source(source)
    reclassify_event_statuses()


@shared_task
def reclassify_statuses_task():
    reclassify_event_statuses()
