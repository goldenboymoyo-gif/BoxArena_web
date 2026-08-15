"""
Generic adapter for a boxing federation's own site/API (e.g. IBA). Left
unimplemented until each federation's actual schedule endpoint (or the
absence of one, requiring manual admin entry instead) has been confirmed —
see backend/README.md.
"""
from .base import RawStreamEvent, StreamSourceAdapter


class FederationSourceAdapter(StreamSourceAdapter):
    source_key = "federation"

    def __init__(self, *, api_endpoint: str | None = None):
        self.api_endpoint = api_endpoint

    def fetch_events(self) -> list[RawStreamEvent]:
        if not self.api_endpoint:
            return []
        raise NotImplementedError(
            "FederationSourceAdapter has no verified schedule API configured yet."
        )
