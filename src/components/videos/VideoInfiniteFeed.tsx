"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { VideoItem } from "@/data/types";
import { VideoCard } from "@/components/cards/VideoCard";

interface VideoInfiniteFeedProps {
  videos: VideoItem[];
  categories: string[];
}

const BATCH = 6;

export function VideoInfiniteFeed({ videos, categories }: VideoInfiniteFeedProps) {
  const [category, setCategory] = useState("All");
  const [visible, setVisible] = useState(BATCH);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () =>
      category === "All"
        ? videos
        : videos.filter((v) => v.category === category),
    [videos, category]
  );

  const shown = useMemo(
    () =>
      Array.from(
        { length: visible },
        (_, i) => filtered[i % filtered.length]
      ),
    [filtered, visible]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && filtered.length > 0) {
          setVisible((v) => v + BATCH);
        }
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [filtered.length]);

  if (filtered.length === 0) {
    return (
      <p className="mt-12 text-center text-sm text-white/40">
        No videos in this category yet.
      </p>
    );
  }

  return (
    <div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {["All", ...categories].map((c) => (
          <button
            key={c}
            onClick={() => {
              setCategory(c);
              setVisible(BATCH);
            }}
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

      <div className="mt-6 space-y-4">
        {shown.map((video, i) => (
          <VideoCard key={`${video.id}-${i}`} video={video} variant="horizontal" />
        ))}
      </div>

      <div ref={sentinelRef} className="flex justify-center py-6">
        <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-white/35">
          <span className="size-1.5 animate-pulse rounded-full bg-[#e31b23]" />
          Loading more videos
        </span>
      </div>
    </div>
  );
}
