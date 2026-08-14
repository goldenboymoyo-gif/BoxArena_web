import type { LiveEvent, VerificationTier } from "@/shared/live";

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function dateKey(iso: string): string {
  return iso.slice(0, 10);
}

function signature(event: LiveEvent): string {
  if (event.fighter1 && event.fighter2) {
    const pair = [normalizeName(event.fighter1), normalizeName(event.fighter2)]
      .sort()
      .join(" vs ");
    return `f|${dateKey(event.eventDate)}|${pair}`;
  }
  return `t|${dateKey(event.eventDate)}|${normalizeName(event.title)}`;
}

function hash(value: string): string {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

const STATUS_RANK: Record<LiveEvent["status"], number> = {
  live: 0,
  upcoming: 1,
  cancelled: 2,
  unavailable: 3,
  completed: 4,
};

const ACCESS_RANK: Record<LiveEvent["access"]["kind"], number> = {
  free: 0,
  subscription: 1,
  ppv: 2,
};

function firstDefined(...values: (string | null)[]): string | null {
  for (const value of values) {
    if (value) return value;
  }
  return null;
}

export function mergeEvents(group: LiveEvent[]): LiveEvent {
  const sorted = [...group].sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]);
  const primary = sorted[0];
  const streams = group.flatMap((event) => event.streams);
  const primaryStream =
    streams.find((stream) => stream.isPrimary) ??
    streams.find((stream) => stream.embeddable && stream.embedUrl) ??
    streams[0];
  const verifiedTiers: VerificationTier[] = sorted
    .filter((event) => event.isVerified && event.verificationTier != null)
    .map((event) => event.verificationTier as VerificationTier);

  return {
    id: `evt-${hash(signature(primary))}`,
    title: sorted.reduce((best, event) => (event.title.length > best.length ? event.title : best), ""),
    organization: firstDefined(...sorted.map((event) => event.organization)),
    promotion: firstDefined(...sorted.map((event) => event.promotion)),
    fighter1: firstDefined(...sorted.map((event) => event.fighter1)),
    fighter2: firstDefined(...sorted.map((event) => event.fighter2)),
    weightClass: firstDefined(...sorted.map((event) => event.weightClass)),
    eventDate: primary.eventDate,
    startTime: primary.startTime,
    timezone: firstDefined(...sorted.map((event) => event.timezone)),
    status: primary.status,
    sourceIds: [...new Set(group.flatMap((event) => event.sourceIds))],
    streams: streams.map((stream) => ({ ...stream, isPrimary: stream.id === primaryStream?.id })),
    thumbnail: firstDefined(...sorted.map((event) => event.thumbnail)),
    venue: firstDefined(...sorted.map((event) => event.venue)),
    location: firstDefined(...sorted.map((event) => event.location)),
    isFree: group.some((event) => event.isFree),
    isVerified: group.some((event) => event.isVerified),
    verificationTier: verifiedTiers.length > 0 ? (Math.min(...verifiedTiers) as VerificationTier) : null,
    access: group
      .map((event) => event.access)
      .sort((a, b) => ACCESS_RANK[a.kind] - ACCESS_RANK[b.kind])[0],
    origin: sorted[0].origin,
    discoveredAt: sorted.map((event) => event.discoveredAt).sort()[0],
    updatedAt: sorted.map((event) => event.updatedAt).sort().at(-1) ?? primary.updatedAt,
  };
}

export function deduplicateEvents(events: LiveEvent[]): LiveEvent[] {
  const groups = new Map<string, LiveEvent[]>();
  for (const event of events) {
    const key = signature(event);
    const group = groups.get(key) ?? [];
    group.push(event);
    groups.set(key, group);
  }
  const merged = [...groups.values()].map(mergeEvents);
  const signatureSet = new Set(merged.map((event) => signature(event)));
  return merged.filter((event) => signatureSet.delete(signature(event)));
}
