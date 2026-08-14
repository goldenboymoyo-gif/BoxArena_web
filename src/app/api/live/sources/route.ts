import { getSourcesFeed } from "@/server/live/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sources = await getSourcesFeed();
    return Response.json({ sources }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to load sources" },
      { status: 500 },
    );
  }
}
