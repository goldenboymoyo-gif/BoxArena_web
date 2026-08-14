import type { AccessKind, EventStatus, VerificationTier } from "@/shared/live";

export interface RawStreamRecord {
  externalId: string;
  title: string;
  fighter1?: string | null;
  fighter2?: string | null;
  weightClass?: string | null;
  organization?: string | null;
  promotion?: string | null;
  eventDate?: string | null;
  startTimeLabel?: string | null;
  timezone?: string | null;
  venue?: string | null;
  location?: string | null;
  url: string;
  embedUrl?: string | null;
  thumbnail?: string | null;
  access: AccessKind;
  verificationTier?: VerificationTier | null;
  status?: EventStatus | null;
  isPrimary?: boolean;
  sourceLabel: string;
}

export function isRawStreamRecord(value: unknown): value is RawStreamRecord {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return typeof record.title === "string" && typeof record.url === "string";
}
