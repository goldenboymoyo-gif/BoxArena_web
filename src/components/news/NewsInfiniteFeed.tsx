"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, View } from "lucide-react";
import type { NewsArticle } from "@/data/types";
import { formatViews, timeAgo } from "@/lib/format";
import { resolveImage } from "@/lib/resolveImage";

interface NewsInfiniteFeedProps {
  articles: NewsArticle[];
}

const BATCH = 6;

export function NewsInfiniteFeed({ articles }: NewsInfiniteFeedProps) {
  const categories = useMemo(
    () => Array.from(new Set(articles.map((a) => a.category))),
    [articles]
  );
  const [category, setCategory] = useState("All");
  const [visible, setVisible] = useState(BATCH);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () =>
      category === "All"
        ? articles
        : articles.filter((a) => a.category === category),
    [articles, category]
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
        No stories in this category yet.
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
        {shown.map((article, i) => (
          <Link
            key={`${article.id}-${i}`}
            href={`/news/${article.id}`}
            className="group flex gap-4 rounded-xl border border-white/10 bg-[#111111] p-3 transition hover:border-[#e31b23]/40 hover:bg-[#151515]"
          >
            <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-40">
              <img
                src={resolveImage(article.image)}
                alt={article.title}
                loading="lazy"
                className="img-zoom h-full w-full object-cover"
              />
              {article.breaking && (
                <span className="absolute left-2 top-2 rounded bg-[#e31b23] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white">
                  Breaking
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
                <span className="text-[#e31b23]">{article.category}</span>
                <span className="text-white/25">·</span>
                <span className="text-white/45">{timeAgo(article.publishedAt)}</span>
                <span className="text-white/25">·</span>
                <span className="text-white/45">{article.readMinutes} min</span>
              </p>
              <h3 className="mt-1.5 line-clamp-2 font-display text-base font-semibold uppercase leading-snug tracking-wide text-white transition group-hover:text-[#ff5a5a] sm:text-lg">
                {article.title}
              </h3>
              <p className="mt-1 hidden line-clamp-1 text-xs text-white/45 sm:block">
                {article.excerpt}
              </p>
              <p className="mt-2 flex items-center gap-3 text-xs text-white/40">
                <span className="flex items-center gap-1">
                  <View className="size-3" /> {formatViews(article.views)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="size-3" /> {formatViews(article.comments)}
                </span>
                <span className="hidden text-white/25 sm:inline">·</span>
                <span className="hidden sm:inline">{article.author}</span>
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div ref={sentinelRef} className="flex justify-center py-6">
        <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-white/35">
          <span className="size-1.5 animate-pulse rounded-full bg-[#e31b23]" />
          Loading more stories
        </span>
      </div>
    </div>
  );
}
