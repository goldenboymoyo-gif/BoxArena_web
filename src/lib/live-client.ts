import type { LiveFeedResponse } from "@/shared/live";

export async function fetchLiveFeed(signal?: AbortSignal): Promise<LiveFeedResponse> {
  const response = await fetch("/api/live/events", {
    cache: "no-store",
    signal,
  });
  if (!response.ok) {
    throw new Error(`Failed to load live feed (${response.status})`);
  }
  return (await response.json()) as LiveFeedResponse;
}

export function formatEventDate(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatEventTime(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function thumbOrFallback(src: string | null): string {
  if (src && src.startsWith("http")) return src;
  if (src && src.startsWith("/")) return src;
  return "";
}

export function videoIdFromEmbed(url: string): string | null {
  const match = url.match(/\/embed\/([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

const EMBEDDABLE_HOSTS = new Set(["www.youtube.com", "youtube.com", "www.youtube-nocookie.com"]);

/**
 * Whether a stream's embedUrl is safe to render in an <iframe>.
 *
 * A source's `allowEmbedding` flag and a feed item's `embedUrl` both
 * ultimately come from source config (see src/server/live/registry.ts and
 * .../sources/generic.ts) — config that's now admin-token-gated, but an
 * iframe src is exactly the kind of value worth double-checking at render
 * time too: this is what stands between "an admin fat-fingered a source
 * config" (or a leaked token) and every visitor's browser loading an
 * arbitrary third-party page framed as "official broadcast". Only known
 * video-embed domains are allowed; anything else falls back to a plain
 * outbound link instead of an iframe.
 */
export function isEmbeddableUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && EMBEDDABLE_HOSTS.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}
