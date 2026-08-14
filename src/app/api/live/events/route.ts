import { getLiveFeed } from "@/server/live/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const feed = await getLiveFeed();
    return Response.json(feed, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to load live feed" },
      { status: 500 },
    );
  }
}
