import type { LiveEvent } from "@/shared/live";
import { createAdapter } from "./sources";
import { deduplicateEvents } from "./dedup";
import { normalizeRecord } from "./ingest";
import { listEnabledSources, markSourceChecked } from "./registry";
import { store } from "./store";

const DEFAULT_POLL_INTERVAL_MS = 5 * 60_000;
const MAX_STALE_MS = 60_000;

let schedulerStarted = false;
let running: Promise<void> | null = null;

export async function refreshAll(): Promise<void> {
  if (running) return running;
  running = runRefresh();
  try {
    await running;
  } finally {
    running = null;
  }
}

async function runRefresh(): Promise<void> {
  const state = store();
  if (state.refreshing) return;
  state.refreshing = true;
  try {
    const sources = await listEnabledSources();
    const adapters = sources.map(createAdapter);
    const results = await Promise.allSettled(adapters.map((adapter) => adapter.check()));

    const collected: LiveEvent[] = [];
    results.forEach((result, index) => {
      const adapter = adapters[index];
      if (result.status === "fulfilled") {
        markSourceChecked(adapter.source.id, result.value.error ? "error" : "ok", result.value.error ?? null);
        const now = result.value.now ?? new Date();
        for (const record of result.value.records) {
          const event = normalizeRecord(record, adapter.source, now);
          if (event) collected.push(event);
        }
      } else {
        markSourceChecked(adapter.source.id, "error", result.reason instanceof Error ? result.reason.message : "Check failed");
      }
    });

    state.events = deduplicateEvents(collected);
    state.refreshedAt = new Date().toISOString();
    state.lastError = null;
  } catch (error) {
    state.lastError = error instanceof Error ? error.message : "Refresh failed";
  } finally {
    state.refreshing = false;
  }
}

export async function ensureFresh(): Promise<void> {
  const state = store();
  if (state.events.length === 0) {
    await refreshAll();
    return;
  }
  const lastRefresh = state.refreshedAt ? new Date(state.refreshedAt).getTime() : 0;
  if (Date.now() - lastRefresh > MAX_STALE_MS) {
    void refreshAll();
  }
}

export function startMonitoring(): void {
  if (schedulerStarted) return;
  if (process.env.NEXT_RUNTIME === "edge") return;
  schedulerStarted = true;
  void refreshAll();
  const interval = setInterval(() => {
    void refreshAll();
  }, DEFAULT_POLL_INTERVAL_MS);
  interval.unref?.();
}
