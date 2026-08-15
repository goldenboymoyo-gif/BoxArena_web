"""
Generic adapter for an official promoter's website/API. Same caveat as
federation.py — unimplemented until a specific promoter's official,
public schedule/stream endpoint is confirmed.
"""
from .base import RawStreamEvent, StreamSourceAdapter


class PromoterSourceAdapter(StreamSourceAdapter):
    source_key = "promoter"

    def __init__(self, *, api_endpoint: str | None = None):
        self.api_endpoint = api_endpoint

    def fetch_events(self) -> list[RawStreamEvent]:
        if not self.api_endpoint:
            return []
        raise NotImplementedError(
            "PromoterSourceAdapter has no verified schedule API configured yet."
        )


class ManualAdminSourceAdapter(StreamSourceAdapter):
    """Some legitimate sources (a federation with no public API, a one-off
    event site) will only ever be addable through an admin manually
    entering the event — this adapter reads events an admin entered
    directly against this StreamSource, rather than polling anything."""

    source_key = "manual"

    def __init__(self, *, source=None):
        self.source = source

    def fetch_events(self) -> list[RawStreamEvent]:
        return []  # no-op: manual entries are created directly as LiveEvent/LiveEventStream rows
