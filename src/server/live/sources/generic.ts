import type { StreamSource } from "@/shared/live";
import { fetchWithTimeout, safeString, type SourceAdapter, type SourceCheckResult } from "../adapter";
import type { RawStreamRecord } from "../raw";
import { isRawStreamRecord } from "../raw";

interface FeedItem {
  [key: string]: unknown;
}

const ACCESS_PATTERN = /(?:ppv|pay-?per-?view)/i;
const SUBSCRIPTION_PATTERN = /(?:subscription|paywall|members only|members-only)/i;

function pick(item: FeedItem, keys: string[]): unknown {
  for (const key of keys) {
    if (item[key] != null) return item[key];
  }
  return undefined;
}

function accessFromTitle(title: string): "free" | "subscription" | "ppv" {
  if (ACCESS_PATTERN.test(title)) return "ppv";
  if (SUBSCRIPTION_PATTERN.test(title)) return "subscription";
  return "free";
}

function toRecord(item: FeedItem, source: StreamSource, tier: 1 | 2 | 3): RawStreamRecord | null {
  const title = safeString(pick(item, ["title", "name", "eventTitle"]));
  if (!title) return null;
  const url = safeString(pick(item, ["url", "watchUrl", "streamUrl", "sourceUrl"]));
  const externalId = safeString(pick(item, ["externalId", "id", "videoId"])) ?? `feed:${title}`;
  const dateValue = pick(item, ["eventDate", "startTime", "date", "scheduledStartTime"]);
  const eventDate = typeof dateValue === "number" ? new Date(dateValue * 1000).toISOString() : safeString(dateValue);
  const status = safeString(pick(item, ["status", "state"]))?.toLowerCase();
  const thumbnail = safeString(pick(item, ["thumbnail", "image", "poster", "thumbnailUrl"]));
  const fighter1 = safeString(pick(item, ["fighter1", "fighterA", "boxerA"]));
  const fighter2 = safeString(pick(item, ["fighter2", "fighterB", "boxerB"]));
  const embedUrl = safeString(pick(item, ["embedUrl", "iframeUrl"]));
  const venue = safeString(pick(item, ["venue"]));
  const location = safeString(pick(item, ["location", "city"]));
  const weightClass = safeString(pick(item, ["weightClass", "division"]));

  const record: RawStreamRecord = {
    externalId,
    title,
    fighter1,
    fighter2,
    weightClass,
    eventDate,
    venue,
    location,
    url: url ?? "",
    embedUrl,
    thumbnail,
    access: accessFromTitle(title),
    verificationTier: tier,
    status: (status as RawStreamRecord["status"]) ?? null,
    sourceLabel: source.name,
  };

  if (url || embedUrl) return record;
  return null;
}

export function createGenericJsonAdapter(source: StreamSource): SourceAdapter {
  return {
    source,
    async check(): Promise<SourceCheckResult> {
      const endpoint = source.apiEndpoint ?? safeString(source.config.url);
      if (!endpoint) return { records: [] };

      const tier = source.verificationTier ?? 3;
      try {
        const response = await fetchWithTimeout(endpoint);
        if (!response.ok) return { records: [], error: `Feed returned HTTP ${response.status}` };
        const payload: unknown = await response.json();
        const items: unknown[] = Array.isArray(payload)
          ? payload
          : typeof payload === "object" && payload !== null && Array.isArray((payload as FeedItem).events)
            ? ((payload as FeedItem).events as unknown[])
            : [];

        const records: RawStreamRecord[] = [];
        for (const item of items) {
          if (isRawStreamRecord(item)) {
            records.push(item);
            continue;
          }
          if (typeof item === "object" && item !== null) {
            const record = toRecord(item as FeedItem, source, tier);
            if (record) records.push(record);
          }
        }
        return { records };
      } catch (error) {
        return { records: [], error: error instanceof Error ? error.message : "Feed unavailable" };
      }
    },
  };
}
