"""
YouTube Live adapter — NOT wired to the real YouTube Data API in this
build. Implementing this for real requires a YouTube Data API key and,
per spec §1-2, only ever surfacing videos from channels Pugnera has
confirmed are the *official* channel of a federation/promoter/broadcaster
— never an arbitrary "boxing livestream" search result, which is exactly
how a piracy restream would slip in.
"""
from .base import RawStreamEvent, StreamSourceAdapter


class YouTubeSourceAdapter(StreamSourceAdapter):
    source_key = "youtube"

    def __init__(self, *, channel_ids: list[str] | None = None, api_key: str | None = None):
        self.channel_ids = channel_ids or []
        self.api_key = api_key

    def fetch_events(self) -> list[RawStreamEvent]:
        if not self.api_key or not self.channel_ids:
            # Not configured — return nothing rather than guessing (spec §13).
            return []
        # TODO: call YouTube Data API `search.list` scoped to
        # self.channel_ids with eventType=live/upcoming, restricted to
        # channels that have been manually confirmed as an official
        # federation/promoter/broadcaster channel. Left unimplemented
        # until those channel ids are confirmed and an API key is
        # provisioned — see backend/README.md ("Live stream aggregation").
        raise NotImplementedError(
            "YouTubeSourceAdapter is not yet connected to a verified official channel list."
        )
