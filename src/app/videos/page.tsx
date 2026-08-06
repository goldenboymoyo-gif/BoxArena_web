import Link from "next/link";
import { Eye, Play, ThumbsUp } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { VideoGallery } from "@/components/videos/VideoGallery";
import { VideoCard } from "@/components/cards/VideoCard";
import { featuredVideos, videoCategories, videos } from "@/data/videos";
import { formatViews, timeAgo } from "@/lib/format";
import { resolveImage } from "@/lib/resolveImage";

export const metadata = {
  title: "Videos & Highlights",
  description:
    "Full fights, knockouts, press conferences, documentaries and boxing tutorials.",
};

export default function VideosPage() {
  const lead = featuredVideos[0];
  const recent = videos.slice(1, 5);

  return (
    <div className="text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(100%_120%_at_50%_-20%,rgba(227,27,35,0.25),transparent_55%)]" />
        <div className="relative mx-auto max-w-[1440px] px-6 py-16 lg:px-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
            <Link href="/" className="transition hover:text-white">Home</Link>
            <span className="text-[#e31b23]">/</span>
            <span className="text-white/70">Videos</span>
          </div>
          <h1 className="mt-4 font-display text-5xl font-bold uppercase tracking-tight text-white sm:text-6xl">
            Video <span className="text-[#e31b23]">Vault</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
            Full fights, knockouts, press conferences, documentaries and tutorials —
            the best of boxing on demand.
          </p>
        </div>
      </section>

      {/* Featured + recent */}
      <section className="mx-auto max-w-[1440px] px-6 py-14 lg:px-8">
        {lead && (
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            <Link
              href={`/videos/${lead.id}`}
              className="group relative block overflow-hidden rounded-3xl border border-white/10"
            >
              <img
                src={
                  lead.youtubeId
                    ? `https://i.ytimg.com/vi/${lead.youtubeId}/hqdefault.jpg`
                    : resolveImage(lead.image)
                }
                alt={lead.title}
                className="img-zoom aspect-video w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <span className="absolute left-4 top-4 rounded-full bg-[#e31b23] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                Featured
              </span>
              <span className="absolute bottom-3 right-3 rounded bg-black/80 px-2 py-1 text-[11px] font-bold tabular-nums text-white">
                {lead.duration}
              </span>
              <div className="absolute inset-0 grid place-items-center">
                <span className="grid size-16 place-items-center rounded-full bg-[#e31b23] text-white transition group-hover:scale-110">
                  <Play className="ml-0.5 size-7 fill-current" />
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff6a6a]">
                  {lead.category}
                </p>
                <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold uppercase leading-tight tracking-wide text-white sm:text-4xl">
                  {lead.title}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-white/60">
                  <span className="flex items-center gap-1">
                    <Eye className="size-3.5" /> {formatViews(lead.views)} views
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="size-3.5" /> {formatViews(lead.likes)}
                  </span>
                  <span>{timeAgo(lead.publishedAt)}</span>
                </div>
              </div>
            </Link>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="h-6 w-1 rounded-full bg-[#e31b23]" />
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#e31b23]">
                  Latest Uploads
                </p>
              </div>
              {recent.map((video) => (
                <VideoCard key={video.id} video={video} variant="horizontal" />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Gallery */}
      <section className="border-t border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-8">
          <SectionHeading
            subtitle="Browse"
            title="All Videos"
            description="Filter by category — highlights, full fights, press conferences, weigh-ins, interviews, documentaries and tutorials."
          />
          <div className="mt-10">
            <VideoGallery videos={videos} categories={videoCategories} />
          </div>
        </div>
      </section>
    </div>
  );
}
