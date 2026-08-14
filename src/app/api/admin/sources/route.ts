import type { NextRequest } from "next/server";
import type { StreamSource } from "@/shared/live";
import { addSource, listSources, removeSource, updateSource, type SourceConfigInput } from "@/server/live/registry";

export const dynamic = "force-dynamic";

const PATCHABLE_FIELDS: (keyof StreamSource)[] = [
  "name",
  "websiteUrl",
  "apiEndpoint",
  "enabled",
  "verified",
  "verificationTier",
  "allowEmbedding",
  "pollIntervalMs",
  "config",
];

function asConfigInput(body: Record<string, unknown>): SourceConfigInput | null {
  if (typeof body.id !== "string" || typeof body.name !== "string") return null;
  return {
    id: body.id,
    name: body.name,
    type: typeof body.type === "string" ? (body.type as SourceConfigInput["type"]) : "event_website",
    websiteUrl: typeof body.websiteUrl === "string" ? body.websiteUrl : null,
    apiEndpoint: typeof body.apiEndpoint === "string" ? body.apiEndpoint : null,
    enabled: typeof body.enabled === "boolean" ? body.enabled : false,
    verified: typeof body.verified === "boolean" ? body.verified : false,
    verificationTier:
      typeof body.verificationTier === "number" && [1, 2, 3].includes(body.verificationTier)
        ? (body.verificationTier as 1 | 2 | 3)
        : null,
    allowEmbedding: typeof body.allowEmbedding === "boolean" ? body.allowEmbedding : false,
    pollIntervalMs:
      typeof body.pollIntervalMs === "number" ? Math.max(30_000, body.pollIntervalMs) : undefined,
    config: typeof body.config === "object" && body.config !== null ? (body.config as Record<string, unknown>) : undefined,
  };
}

export async function GET() {
  const sources = await listSources();
  return Response.json({ sources });
}

export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }
  const input = asConfigInput(body as Record<string, unknown>);
  if (!input) return Response.json({ error: "id and name are required" }, { status: 400 });
  const created = await addSource(input);
  if (!created) return Response.json({ error: "Source already exists" }, { status: 409 });
  return Response.json({ source: created }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }
  const payload = body as Record<string, unknown>;
  const id = typeof payload.id === "string" ? payload.id : null;
  if (!id) return Response.json({ error: "id is required" }, { status: 400 });
  const patchObject = typeof payload.patch === "object" && payload.patch !== null ? (payload.patch as Record<string, unknown>) : {};
  const patch: Partial<StreamSource> = {};
  for (const key of PATCHABLE_FIELDS) {
    if (key in patchObject) {
      (patch as Record<string, unknown>)[key] = patchObject[key];
    }
  }
  const updated = await updateSource(id, patch);
  if (!updated) return Response.json({ error: "Source not found" }, { status: 404 });
  return Response.json({ source: updated });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return Response.json({ error: "id is required" }, { status: 400 });
  const removed = await removeSource(id);
  if (!removed) return Response.json({ error: "Source not found" }, { status: 404 });
  return Response.json({ ok: true });
}
