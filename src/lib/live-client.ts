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
