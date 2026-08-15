import type { NextRequest } from "next/server";
import { refreshAll } from "@/server/live/monitor";
import { getSourcesFeed } from "@/server/live/api";
import { requireAdmin } from "@/server/live/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    await refreshAll();
    const sources = await getSourcesFeed();
    return Response.json({ ok: true, sources, refreshedAt: new Date().toISOString() });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "Refresh failed" },
      { status: 500 },
    );
  }
}
