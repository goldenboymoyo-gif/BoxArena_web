import type { VerificationTier } from "@/shared/live";
import type { BoxingEvent } from "@/data/types";
import { events, completedEvents } from "@/data/events";
import { buildIsoFromDateAndTime } from "../engine";
import type { RawStreamRecord } from "../raw";
import type { SourceCheckResult } from "../adapter";

const DEMO_NOW = "2026-08-29T19:45:00Z";

const DEMO_LIVE_EVENT_ID = "inoue-vs-nakatani";

const DEMO_YOUTUBE_ID = "wvYrvXEvnhc";

const BROADCASTER_URLS: Record<string, string> = {
  DAZN: "https://www.dazn.com/",
  "DAZN PPV": "https://www.dazn.com/",
  "Sky Sports Box Office": "https://www.sky.com/",
  "Amazon Prime Video": "https://www.primevideo.com/",
  "Amazon Prime PPV": "https://www.primevideo.com/",
  "ESPN+ PPV": "https://plus.espn.com/",
};

function broadcasterUrl(broadcaster: string): string {
  return BROADCASTER_URLS[broadcaster] ?? "";
}

function deriveAccess(broadcaster: string): "free" | "subscription" | "ppv" {
  const value = broadcaster.toLowerCase();
  if (value.includes("ppv") || value.includes("box office")) return "ppv";
  if (value.includes("prime") || value.includes("espn") || value.includes("sky sports") || value.includes("dazn")) return "subscription";
  return "free";
}

function toRecord(event: BoxingEvent): RawStreamRecord {
  return {
    externalId: `demo:${event.id}`,
    title: event.title,
    fighter1: event.fighterA,
    fighter2: event.fighterB,
    weightClass: event.weightClass,
    organization: event.broadcaster,
    promotion: event.promoter,
    eventDate: buildIsoFromDateAndTime(event.date, event.time) ?? undefined,
    startTimeLabel: event.time,
    timezone: event.timezone,
    venue: event.venue,
    location: event.city,
    url: broadcasterUrl(event.broadcaster),
    thumbnail: event.venueImage,
    access: deriveAccess(event.broadcaster),
    verificationTier: 1 as VerificationTier,
    sourceLabel: "Pugnera Demo",
  };
}

export function buildDemoRecords(): SourceCheckResult {
  const records: RawStreamRecord[] = events.map(toRecord);
  for (const event of completedEvents) {
    records.push(toRecord(event));
  }

  const live = records.find((record) => record.externalId === `demo:${DEMO_LIVE_EVENT_ID}`);
  if (live) {
    live.access = "free";
    live.organization = "Ohashi Promotions";
    live.url = `https://www.youtube.com/watch?v=${DEMO_YOUTUBE_ID}`;
    live.embedUrl = `https://www.youtube.com/embed/${DEMO_YOUTUBE_ID}`;
    live.isPrimary = true;
    live.sourceLabel = "Official YouTube (demo embed)";
  }

  return { records, now: DEMO_NOW };
}
