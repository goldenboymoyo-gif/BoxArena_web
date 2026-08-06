import { IMAGES } from "@/data/images";

export function resolveImage(key: string): string {
  const groups = IMAGES as unknown as Record<string, Record<string, string>>;
  for (const group of Object.values(groups)) {
    if (typeof group === "object" && group && key in group) return group[key];
  }
  return IMAGES.venues.msg;
}
