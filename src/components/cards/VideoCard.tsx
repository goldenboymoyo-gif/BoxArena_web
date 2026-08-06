import Link from "next/link";
import { Clock3, Eye, Play, ThumbsUp } from "lucide-react";
import type { VideoItem } from "@/data/types";
import { formatViews, timeAgo } from "@/lib/format";
import { resolveImage } from "@/lib/resolveImage";

interface VideoCardProps {
  video: VideoItem;
  variant?: "default" | "horizontal";
}

export function VideoCard({ video, variant = "default" }: VideoCardProps) {
  const img = resolveImage(video.image);

  if (variant === "horizontal") {
    return (
      <Link
        href={`/videos/${video.id}`}
        className="group flex gap-4 rounded-xl border border-white/10 bg-[#111111] p-3 transition hover:border-[#e31b23]/40 hover:bg-[#151515]"
      >
        <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg">
          <img src={img} alt={video.title} loading="lazy" className="img-zoom h-full w-full object-cover" />
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white">
            {video.duration}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e31b23]">{video.category}</p>
          <h3 className="mt-1 line-clamp-2 font-display text-base font-semibold uppercase leading-snug tracking-wide text-white">
            {video.title}
          </h3>
          <p className="mt-1 flex items-center gap-2 text-xs text-white/45">
            <span>{formatViews(video.views)} views</span>
            <span className="text-white/25">·</span>
            <span>{timeAgo(video.publishedAt)}</span>
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/videos/${video.id}`}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-[#111111] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#e31b23]/45 hover:shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
    >
      <div className="relative aspect-video overflow-hidden">
        <img src={img} alt={video.title} loading="lazy" className="img-zoom h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/25 transition group-hover:bg-black/10" />
        <span className="absolute left-3 top-3 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md">
          {video.category}
        </span>
        <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded bg-black/80 px-2 py-1 text-[11px] font-bold tabular-nums text-white">
          <Clock3 className="size-3" /> {video.duration}
        </span>
        <div className="absolute inset-0 grid place-items-center">
          <span className="grid size-14 place-items-center rounded-full bg-[#e31b23] text-white shadow-[0_0_0_8px_rgba(227,27,35,0.25)] transition group-hover:scale-110">
            <Play className="ml-0.5 size-6 fill-current" />
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 font-display text-lg font-semibold uppercase leading-snug tracking-wide text-white transition group-hover:text-[#ff5a5a]">
          {video.title}
        </h3>
        <div className="mt-3 flex items-center gap-4 text-xs text-white/45">
          <span className="flex items-center gap-1">
            <Eye className="size-3.5" /> {formatViews(video.views)}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp className="size-3.5" /> {formatViews(video.likes)}
          </span>
          <span>{timeAgo(video.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
