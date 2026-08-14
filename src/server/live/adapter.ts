import type { StreamSource } from "@/shared/live";
import type { RawStreamRecord } from "./raw";

export interface SourceCheckResult {
  records: RawStreamRecord[];
  error?: string;
  now?: string;
}

export interface SourceAdapter {
  readonly source: StreamSource;
  check(): Promise<SourceCheckResult>;
}

const DEFAULT_TIMEOUT_MS = 8000;

export async function fetchWithTimeout(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Pugnera/1.0 (+https://github.com/goldenboymoyo-gif/BoxArena_web)",
        Accept: "application/json, text/xml, text/html",
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

export function safeNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function safeString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}
