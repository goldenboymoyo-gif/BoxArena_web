"""
Source adapter interface (spec §3, §17).

Every source integration — YouTube, a federation's own site, a promoter's
website, a broadcaster's API — implements this interface. The ingestion
pipeline (apps.streams.services.ingest) only ever talks to
StreamSourceAdapter, never to a source-specific client directly, so adding
a new legitimate source never requires touching the Live page.

None of the concrete adapters below are wired up to a real, live API yet.
Doing that requires, per source: confirming the integration is actually
free/public and authorized (not a paywall bypass), reading their current
API/embedding terms, and obtaining any required API key — none of which
can be fabricated here. Until an adapter is verified, its StreamSource row
should stay `enabled=False` so it contributes nothing to the Live feed
(spec §13 empty-state rule: never invent a live event).
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class RawStreamEvent:
    """What an adapter hands back — not yet deduplicated or persisted."""

    title: str
    fighter_1: str
    fighter_2: str
    organization: str
    start_time: datetime
    source_url: str
    weight_class: str = ""
    promotion: str = ""
    venue: str = ""
    location: str = ""
    thumbnail_url: str = ""
    is_free: bool = True
    requires_subscription: bool = False
    requires_ppv: bool = False
    embed_url: str = ""
    is_embeddable: bool = False
    raw: dict = field(default_factory=dict)


class StreamSourceAdapter(ABC):
    """One implementation per legitimate source."""

    source_key: str

    @abstractmethod
    def fetch_events(self) -> list[RawStreamEvent]:
        """Return currently known upcoming/live events from this source.
        Must return an empty list rather than raising when the source has
        nothing right now — an empty result is a normal, expected state
        (spec §13), not an error.
        """
        ...
