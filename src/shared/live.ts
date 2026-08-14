export type SourceType =
  | "youtube"
  | "iba"
  | "federation"
  | "promoter"
  | "broadcaster"
  | "event_website"
  | "social"
  | "demo";

export type EventStatus = "upcoming" | "live" | "completed" | "cancelled" | "unavailable";

export type AccessKind = "free" | "subscription" | "ppv";

export type AccessModel = { kind: AccessKind; label?: string };

export type VerificationTier = 1 | 2 | 3;

export interface EventStream {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceType: SourceType;
  label: string;
  url: string;
  embedUrl: string | null;
  embeddable: boolean;
  isPrimary: boolean;
  isVerified: boolean;
}

export interface StreamSource {
  id: string;
  name: string;
  type: SourceType;
  websiteUrl: string | null;
  apiEndpoint: string | null;
  enabled: boolean;
  verified: boolean;
  verificationTier: VerificationTier | null;
  allowEmbedding: boolean;
  pollIntervalMs: number;
  config: Record<string, unknown>;
  lastCheckedAt: string | null;
  lastStatus: "ok" | "error" | "never";
  error: string | null;
}

export interface LiveEvent {
  id: string;
  title: string;
  organization: string | null;
  promotion: string | null;
  fighter1: string | null;
  fighter2: string | null;
  weightClass: string | null;
  eventDate: string;
  startTime: string;
  timezone: string | null;
  status: EventStatus;
  sourceIds: string[];
  streams: EventStream[];
  thumbnail: string | null;
  venue: string | null;
  location: string | null;
  isFree: boolean;
  isVerified: boolean;
  verificationTier: VerificationTier | null;
  access: AccessModel;
  origin: string;
  discoveredAt: string;
  updatedAt: string;
}

export interface LiveFeedResponse {
  live: LiveEvent[];
  upcoming: LiveEvent[];
  completed: LiveEvent[];
  sources: StreamSource[];
  refreshedAt: string | null;
  serverTime: string;
}

export interface SourceFeedItem {
  id: string;
  name: string;
  type: SourceType;
  enabled: boolean;
  verified: boolean;
  verificationTier: VerificationTier | null;
  lastCheckedAt: string | null;
  lastStatus: StreamSource["lastStatus"];
  error: string | null;
}

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  youtube: "Official YouTube",
  iba: "IBA",
  federation: "National Federation",
  promoter: "Promoter",
  broadcaster: "Broadcaster",
  event_website: "Event Website",
  social: "Social Livestream",
  demo: "Pugnera Demo",
};

export const TIER_LABELS: Record<VerificationTier, string> = {
  1: "Official",
  2: "Authorized",
  3: "Public",
};

export function tierLabel(tier: VerificationTier | null): string | null {
  return tier == null ? null : TIER_LABELS[tier];
}

export function accessLabel(access: AccessModel): string {
  if (access.kind === "free") return "Free to watch";
  if (access.kind === "subscription") return "Subscription required";
  return "PPV";
}
