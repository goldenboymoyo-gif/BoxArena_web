import type { StreamSource } from "@/shared/live";
import type { SourceAdapter } from "../adapter";
import { buildDemoRecords } from "./demo";
import { createYouTubeAdapter } from "./youtube";
import { createGenericJsonAdapter } from "./generic";

export function createAdapter(source: StreamSource): SourceAdapter {
  switch (source.type) {
    case "demo":
      return { source, check: async () => buildDemoRecords() };
    case "youtube":
      return createYouTubeAdapter(source);
    default:
      return createGenericJsonAdapter(source);
  }
}
