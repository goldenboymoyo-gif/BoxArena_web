"use client";

import { useMemo, useState } from "react";
import type { VideoItem } from "@/data/types";
import { VideoCard } from "@/components/cards/VideoCard";

interface VideoGalleryProps {
  videos: VideoItem[];
  categories: string[];
}

export function VideoGallery({ videos, categories }: VideoGalleryProps) {
  const [category, setCategory] = useState("All");

  const filtered = useMemo(
    () =>
      category === "All"
        ? videos
        : videos.filter((v) => v.category === category),
    [videos, category]
  );

  return (
    <div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {["All", ...categories].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition ${
              category === c
                ? "border-[#e31b23] bg-[#e31b23] text-white"
                : "border-white/15 bg-white/5 text-white/60 hover:border-[#e31b23]/50 hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="mt-12 text-center text-sm text-white/40">
          No videos in this category yet.
        </p>
      )}
    </div>
  );
}
