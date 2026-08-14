import type { EventStatus, LiveEvent } from "@/shared/live";

export interface StatusInput {
  eventDate?: string | null;
  explicitStatus?: EventStatus | null;
  now?: string | number | null;
  liveWindowMinutes?: number;
}

const DEFAULT_LIVE_WINDOW_MINUTES = 180;

export function computeEventStatus(input: StatusInput): EventStatus {
  if (input.explicitStatus === "cancelled" || input.explicitStatus === "unavailable") {
    return input.explicitStatus;
  }
  if (!input.eventDate) return "upcoming";
  const start = new Date(input.eventDate).getTime();
  if (Number.isNaN(start)) return "upcoming";
  const nowMs =
    typeof input.now === "number" ? input.now : new Date(input.now ?? Date.now()).getTime();
  if (Number.isNaN(nowMs)) return "upcoming";
  if (nowMs < start) return "upcoming";
  const windowMs = (input.liveWindowMinutes ?? DEFAULT_LIVE_WINDOW_MINUTES) * 60_000;
  if (nowMs < start + windowMs) return "live";
  return "completed";
}

const TIME_PATTERN = /^(\d{1,2}):(\d{2})/;

export function extractTimeParts(label: string): { hours: number; minutes: number } | null {
  const match = label.match(TIME_PATTERN);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes };
}

export function buildIsoFromDateAndTime(dateStr: string, timeLabel: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const parts = extractTimeParts(timeLabel);
  if (!parts) return null;
  const iso = `${dateStr}T${String(parts.hours).padStart(2, "0")}:${String(parts.minutes).padStart(2, "0")}:00Z`;
  return Number.isNaN(new Date(iso).getTime()) ? null : iso;
}

function tierScore(tier: number | null): number {
  if (tier == null) return Number.MAX_SAFE_INTEGER;
  return tier;
}

function startMs(event: LiveEvent): number {
  const ms = new Date(event.eventDate).getTime();
  return Number.isNaN(ms) ? Number.MAX_SAFE_INTEGER : ms;
}

export function sortEvents(events: LiveEvent[]): LiveEvent[] {
  return [...events].sort((a, b) => {
    const liveA = a.status === "live" ? 0 : 1;
    const liveB = b.status === "live" ? 0 : 1;
    if (liveA !== liveB) return liveA - liveB;
    const freeA = a.isFree ? 0 : 1;
    const freeB = b.isFree ? 0 : 1;
    if (freeA !== freeB) return freeA - freeB;
    const tierA = tierScore(a.verificationTier);
    const tierB = tierScore(b.verificationTier);
    if (tierA !== tierB) return tierA - tierB;
    return startMs(a) - startMs(b);
  });
}
