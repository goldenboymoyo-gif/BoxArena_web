import Link from "next/link";
import { ArrowRight, MessageCircle, View } from "lucide-react";
import type { NewsArticle } from "@/data/types";
import { formatViews, timeAgo } from "@/lib/format";
import { resolveImage } from "@/lib/resolveImage";

interface NewsCardProps {
  article: NewsArticle;
  variant?: "default" | "wide" | "overlay";
}

export function NewsCard({ article, variant = "default" }: NewsCardProps) {
  const img = resolveImage(article.image);

  if (variant === "overlay") {
    return (
      <Link
        href={`/news/${article.id}`}
        className="group relative block h-full min-h-[320px] overflow-hidden rounded-2xl border border-white/10"
      >
        <img src={img} alt={article.title} loading="lazy" className="img-zoom absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative flex h-full min-h-[320px] flex-col justify-end p-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-[#e31b23] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
              {article.category}
            </span>
            {article.breaking && (
              <span className="animate-pulse rounded-full border border-[#e31b23]/50 bg-[#e31b23]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#ff6a6a]">
                Breaking
              </span>
            )}
          </div>
          <h3 className="font-display text-2xl font-semibold uppercase leading-tight tracking-wide text-white transition group-hover:text-[#ff5a5a]">
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-white/60">{article.excerpt}</p>
          <div className="mt-4 flex items-center gap-4 text-xs text-white/50">
            <span>{article.author}</span>
            <span>{timeAgo(article.publishedAt)}</span>
            <span className="flex items-center gap-1">
              <View className="size-3.5" /> {formatViews(article.views)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/news/${article.id}`}
      className={`group block overflow-hidden rounded-2xl border border-white/10 bg-[#111111] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#e31b23]/45 hover:shadow-[0_24px_60px_rgba(0,0,0,0.55)] ${variant === "wide" ? "sm:flex" : ""}`}
    >
      <div className={variant === "wide" ? "sm:w-2/5" : "relative h-44 overflow-hidden"}>
        <img
          src={img}
          alt={article.title}
          loading="lazy"
          className={`img-zoom h-full w-full object-cover ${variant === "wide" ? "h-44 sm:h-full" : ""}`}
        />
        {article.breaking && (
          <span className="absolute left-3 top-3 rounded-full bg-[#e31b23] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
            Breaking
          </span>
        )}
      </div>
      <div className={`flex flex-1 flex-col p-5 ${variant === "wide" ? "sm:p-6" : ""}`}>
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
          <span className="text-[#e31b23]">{article.category}</span>
          <span className="text-white/25">·</span>
          <span className="text-white/45">{timeAgo(article.publishedAt)}</span>
          <span className="text-white/25">·</span>
          <span className="text-white/45">{article.readMinutes} min read</span>
        </div>
        <h3 className="mt-2.5 font-display text-xl font-semibold uppercase leading-snug tracking-wide text-white transition group-hover:text-[#ff5a5a]">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/50">{article.excerpt}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex items-center gap-3 text-xs text-white/45">
            <span className="flex items-center gap-1">
              <View className="size-3.5" /> {formatViews(article.views)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="size-3.5" /> {formatViews(article.comments)}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/60 transition group-hover:text-white">
            Read <ArrowRight className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
