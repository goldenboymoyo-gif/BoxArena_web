import fs from "node:fs/promises";
import path from "node:path";
import type { SourceType, StreamSource, VerificationTier } from "@/shared/live";

export interface SourceConfigInput {
  id: string;
  name: string;
  type: SourceType;
  websiteUrl?: string | null;
  apiEndpoint?: string | null;
  enabled?: boolean;
  verified?: boolean;
  verificationTier?: VerificationTier | null;
  allowEmbedding?: boolean;
  pollIntervalMs?: number;
  config?: Record<string, unknown>;
}

const DEFAULT_SOURCES: SourceConfigInput[] = [
  {
    id: "demo",
    name: "Pugnera Demo",
    type: "demo",
    websiteUrl: null,
    enabled: true,
    verified: true,
    verificationTier: 1,
    allowEmbedding: true,
    pollIntervalMs: 60_000,
    config: {},
  },
  {
    id: "youtube",
    name: "Official YouTube",
    type: "youtube",
    websiteUrl: "https://www.youtube.com/",
    enabled: true,
    verified: true,
    verificationTier: 3,
    allowEmbedding: true,
    pollIntervalMs: 5 * 60_000,
    config: { channels: [] },
  },
  {
    id: "iba",
    name: "IBA",
    type: "iba",
    websiteUrl: "https://www.iba.sport/",
    enabled: true,
    verified: true,
    verificationTier: 1,
    allowEmbedding: false,
    pollIntervalMs: 15 * 60_000,
    config: {},
  },
  {
    id: "federations",
    name: "National Federations",
    type: "federation",
    websiteUrl: null,
    enabled: true,
    verified: true,
    verificationTier: 1,
    allowEmbedding: false,
    pollIntervalMs: 15 * 60_000,
    config: {},
  },
  {
    id: "promoters",
    name: "Official Promoters",
    type: "promoter",
    websiteUrl: null,
    enabled: true,
    verified: true,
    verificationTier: 1,
    allowEmbedding: false,
    pollIntervalMs: 15 * 60_000,
    config: {},
  },
  {
    id: "broadcasters",
    name: "Free Broadcasters",
    type: "broadcaster",
    websiteUrl: null,
    enabled: true,
    verified: true,
    verificationTier: 2,
    allowEmbedding: false,
    pollIntervalMs: 15 * 60_000,
    config: {},
  },
  {
    id: "event-websites",
    name: "Event Websites",
    type: "event_website",
    websiteUrl: null,
    enabled: true,
    verified: false,
    verificationTier: null,
    allowEmbedding: false,
    pollIntervalMs: 15 * 60_000,
    config: {},
  },
];

const STORE_FILE = path.join(process.cwd(), "data", "sources.json");

function toSource(input: SourceConfigInput): StreamSource {
  return {
    id: input.id,
    name: input.name,
    type: input.type,
    websiteUrl: input.websiteUrl ?? null,
    apiEndpoint: input.apiEndpoint ?? null,
    enabled: input.enabled ?? false,
    verified: input.verified ?? false,
    verificationTier: input.verificationTier ?? null,
    allowEmbedding: input.allowEmbedding ?? false,
    pollIntervalMs: input.pollIntervalMs ?? 15 * 60_000,
    config: input.config ?? {},
    lastCheckedAt: null,
    lastStatus: "never",
    error: null,
  };
}

function hasRuntimeFields(source: unknown): source is StreamSource {
  return (
    typeof source === "object" &&
    source !== null &&
    typeof (source as StreamSource).id === "string" &&
    typeof (source as StreamSource).name === "string"
  );
}

async function loadPersisted(): Promise<StreamSource[]> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(hasRuntimeFields);
  } catch {
    return [];
  }
}

async function persist(sources: StreamSource[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(STORE_FILE), { recursive: true });
    await fs.writeFile(STORE_FILE, JSON.stringify(sources, null, 2), "utf8");
  } catch {
    // persistence is best-effort
  }
}

type RegistryState = { sources: StreamSource[]; ready: Promise<void> };

declare global {
  var __pugneraSourceRegistry: RegistryState | undefined;
}

function initialState(): RegistryState {
  const state: RegistryState = {
    sources: DEFAULT_SOURCES.map(toSource),
    ready: Promise.resolve(),
  };
  state.ready = loadPersisted().then((persisted) => {
    const byId = new Map(state.sources.map((source) => [source.id, source]));
    for (const saved of persisted) {
      const existing = byId.get(saved.id);
      if (existing) {
        Object.assign(existing, saved);
      } else {
        state.sources.push(saved);
        byId.set(saved.id, saved);
      }
    }
  });
  return state;
}

function registry(): RegistryState {
  if (!globalThis.__pugneraSourceRegistry) {
    globalThis.__pugneraSourceRegistry = initialState();
  }
  return globalThis.__pugneraSourceRegistry;
}

export async function listSources(): Promise<StreamSource[]> {
  const state = registry();
  await state.ready;
  return state.sources.map((source) => ({ ...source, config: { ...source.config } }));
}

export async function listEnabledSources(): Promise<StreamSource[]> {
  const sources = await listSources();
  return sources.filter((source) => source.enabled);
}

export function getSource(id: string): StreamSource | undefined {
  const state = registry();
  return state.sources.find((source) => source.id === id);
}

export async function addSource(input: SourceConfigInput): Promise<StreamSource | null> {
  const state = registry();
  await state.ready;
  if (state.sources.some((source) => source.id === input.id)) return null;
  const source = toSource(input);
  state.sources.push(source);
  await persist(state.sources);
  return { ...source, config: { ...source.config } };
}

export async function updateSource(id: string, patch: Partial<StreamSource>): Promise<StreamSource | null> {
  const state = registry();
  await state.ready;
  const source = state.sources.find((entry) => entry.id === id);
  if (!source) return null;
  const safePatch: Partial<StreamSource> = { ...patch };
  delete safePatch.id;
  delete safePatch.lastCheckedAt;
  delete safePatch.lastStatus;
  delete safePatch.error;
  Object.assign(source, safePatch);
  await persist(state.sources);
  return { ...source, config: { ...source.config } };
}

export async function removeSource(id: string): Promise<boolean> {
  const state = registry();
  await state.ready;
  const index = state.sources.findIndex((source) => source.id === id);
  if (index === -1) return false;
  state.sources.splice(index, 1);
  await persist(state.sources);
  return true;
}

export function markSourceChecked(id: string, status: "ok" | "error", error: string | null): void {
  const state = registry();
  const source = state.sources.find((entry) => entry.id === id);
  if (!source) return;
  source.lastCheckedAt = new Date().toISOString();
  source.lastStatus = status;
  source.error = error;
}
