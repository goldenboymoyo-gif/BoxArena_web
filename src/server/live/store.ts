import type { LiveEvent } from "@/shared/live";

export interface LiveStoreState {
  events: LiveEvent[];
  refreshedAt: string | null;
  refreshing: boolean;
  lastError: string | null;
}

declare global {
  var __pugneraLiveStore: LiveStoreState | undefined;
}

function initialState(): LiveStoreState {
  return {
    events: [],
    refreshedAt: null,
    refreshing: false,
    lastError: null,
  };
}

export function store(): LiveStoreState {
  if (!globalThis.__pugneraLiveStore) {
    globalThis.__pugneraLiveStore = initialState();
  }
  return globalThis.__pugneraLiveStore;
}
