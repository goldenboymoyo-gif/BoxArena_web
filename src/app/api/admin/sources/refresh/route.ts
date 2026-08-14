import { refreshAll } from "@/server/live/monitor";
import { getSourcesFeed } from "@/server/live/api";

export const dynamic = "force-dynamic";

export async function POST() {
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
