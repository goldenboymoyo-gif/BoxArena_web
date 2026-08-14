import type { LiveEvent, LiveFeedResponse, SourceFeedItem } from "@/shared/live";
import { sortEvents } from "./engine";
import { ensureFresh } from "./monitor";
import { listSources } from "./registry";
import { store } from "./store";

function verifiedOnly(events: LiveEvent[]): LiveEvent[] {
  return events.filter((event) => event.isVerified);
}

export async function getLiveFeed(): Promise<LiveFeedResponse> {
  await ensureFresh();
  const state = store();
  const verified = verifiedOnly(state.events);

  const live = sortEvents(verified.filter((event) => event.status === "live"));
  const upcoming = sortEvents(verified.filter((event) => event.status === "upcoming"));
  const completed = sortEvents(verified.filter((event) => event.status === "completed"));

  const sources = (await listSources()).filter((source) => source.enabled && source.verified);

  return {
    live,
    upcoming,
    completed,
    sources,
    refreshedAt: state.refreshedAt,
    serverTime: new Date().toISOString(),
  };
}

export async function getSourcesFeed(): Promise<SourceFeedItem[]> {
  await ensureFresh();
  const sources = await listSources();
  return sources.map((source) => ({
    id: source.id,
    name: source.name,
    type: source.type,
    enabled: source.enabled,
    verified: source.verified,
    verificationTier: source.verificationTier,
    lastCheckedAt: source.lastCheckedAt,
    lastStatus: source.lastStatus,
    error: source.error,
  }));
}
