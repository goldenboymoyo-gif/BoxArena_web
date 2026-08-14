import type { AccessModel, LiveEvent, StreamSource, VerificationTier } from "@/shared/live";
import type { RawStreamRecord } from "./raw";
import { computeEventStatus } from "./engine";

function makeStream(record: RawStreamRecord, source: StreamSource, index: number): LiveEvent["streams"][number] {
  const embedAllowed = source.allowEmbedding && Boolean(record.embedUrl);
  const url = record.url || record.embedUrl || source.websiteUrl || "";
  return {
    id: `${source.id}:${record.externalId}:stream-${index}`,
    sourceId: source.id,
    sourceName: source.name,
    sourceType: source.type,
    label: record.sourceLabel,
    url,
    embedUrl: embedAllowed ? record.embedUrl ?? null : null,
    embeddable: embedAllowed,
    isPrimary: Boolean(record.isPrimary),
    isVerified: source.verified && source.enabled,
  };
}

export function normalizeRecord(record: RawStreamRecord, source: StreamSource, now: string | number | Date): LiveEvent | null {
  if (!source.enabled) return null;

  const tier: VerificationTier | null = record.verificationTier ?? source.verificationTier ?? null;
  const verified = source.verified && tier != null;
  const status = computeEventStatus({
    eventDate: record.eventDate,
    explicitStatus: record.status,
    now: now instanceof Date ? now.getTime() : now,
  });
  const access: AccessModel =
    record.access === "ppv"
      ? { kind: "ppv" }
      : record.access === "subscription"
        ? { kind: "subscription" }
        : { kind: "free" };

  const streams = [makeStream(record, source, 0)];

  return {
    id: `${source.id}:${record.externalId}`,
    title: record.title,
    organization: record.organization ?? null,
    promotion: record.promotion ?? null,
    fighter1: record.fighter1 ?? null,
    fighter2: record.fighter2 ?? null,
    weightClass: record.weightClass ?? null,
    eventDate: record.eventDate ?? "",
    startTime: record.startTimeLabel ?? record.eventDate ?? "",
    timezone: record.timezone ?? null,
    status,
    sourceIds: [source.id],
    streams,
    thumbnail: record.thumbnail ?? null,
    venue: record.venue ?? null,
    location: record.location ?? null,
    isFree: record.access === "free",
    isVerified: verified,
    verificationTier: verified ? tier : null,
    access,
    origin: record.sourceLabel,
    discoveredAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
