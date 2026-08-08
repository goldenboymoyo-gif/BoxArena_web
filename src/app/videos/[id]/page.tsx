import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock3, Eye, ThumbsUp } from "lucide-react";
import { getVideo, videos } from "@/data/videos";
import { formatViews, timeAgo } from "@/lib/format";
import { VideoCard } from "@/components/cards/VideoCard";
import { BoxArenaPlayer } from "@/components/media/BoxArenaPlayer";
import { resolveImage } from "@/lib/resolveImage";

export function generateStaticParams() {
  return videos.map((v) => ({ id: v.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const video = getVideo(id);
  if (!video) return {};
  return {
    title: video.title,
    description: video.description,
  };
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = getVideo(id);
  if (!video || !video.youtubeId) notFound();

  const related = videos.filter((v) => v.id !== video.id).slice(0, 4);

  return (
    <div className="text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(100%_120%_at_50%_-20%,rgba(227,27,35,0.25),transparent_55%)]" />
        <div className="relative mx-auto max-w-[1440px] px-6 py-12 lg:px-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
            <Link href="/" className="transition hover:text-white">Home</Link>
            <span className="text-white/25">/</span>
            <Link href="/videos" className="transition hover:text-white">Videos</Link>
            <span className="text-[#e31b23]">/</span>
            <span className="max-w-[220px] truncate text-white/70">{video.title}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-12 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.7fr_1fr]">
          <div>
            <BoxArenaPlayer
              videoId={video.youtubeId}
              title={video.title}
              label={video.category}
              poster={resolveImage(video.image)}
            />

            <div className="mt-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/85">
                  {video.category}
                </span>
              </div>
              <h1 className="mt-4 font-display text-3xl font-semibold uppercase leading-tight tracking-wide text-white sm:text-4xl">
                {video.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/55">
                <span className="flex items-center gap-1.5">
                  <Clock3 className="size-4 text-[#e31b23]" /> {video.duration}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="size-4 text-[#e31b23]" /> {formatViews(video.views)} views
                </span>
                <span className="flex items-center gap-1.5">
                  <ThumbsUp className="size-4 text-[#e31b23]" /> {formatViews(video.likes)} likes
                </span>
                <span>{timeAgo(video.publishedAt)}</span>
              </div>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-white/60">
                {video.description}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="h-6 w-1 rounded-full bg-[#e31b23]" />
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#e31b23]">
                More Fights
              </p>
            </div>
            <div className="mt-5 space-y-4">
              {related.map((v) => (
                <VideoCard key={v.id} video={v} variant="horizontal" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
