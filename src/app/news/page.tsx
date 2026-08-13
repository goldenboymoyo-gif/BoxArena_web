import Link from "next/link";
import { Flame, MessageCircle, View } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { NewsInfiniteFeed } from "@/components/news/NewsInfiniteFeed";
import { breakingNews, latestNews } from "@/data/news";
import { formatViews, timeAgo } from "@/lib/format";
import { resolveImage } from "@/lib/resolveImage";

export const metadata = {
  title: "Boxing News",
  description:
    "Breaking boxing news, fight announcements, results, interviews and analysis.",
};

export default function NewsPage() {
  const lead = latestNews[0];

  return (
    <div className="text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(100%_120%_at_50%_-20%,rgba(227,27,35,0.25),transparent_55%)]" />
        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 py-10 sm:py-16 lg:px-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
            <Link href="/" className="transition hover:text-white">Home</Link>
            <span className="text-[#e31b23]">/</span>
            <span className="text-white/70">News</span>
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
            The <span className="text-[#e31b23]">Newsroom</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
            Breaking stories, fight announcements, results, interviews and analysis
            from the world of professional boxing.
          </p>
        </div>
      </section>

      {/* Breaking banner */}
      {breakingNews.length > 0 && (
        <section className="border-b border-[#e31b23]/30 bg-gradient-to-r from-[#e31b23]/20 via-[#e31b23]/5 to-transparent">
          <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#e31b23] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
              <Flame className="size-3.5" /> Breaking
            </span>
            <p className="truncate text-sm font-medium text-white/80">
              {breakingNews[0].title}
            </p>
            <span className="ml-auto hidden shrink-0 text-xs text-white/45 sm:block">
              {timeAgo(breakingNews[0].publishedAt)}
            </span>
          </div>
        </section>
      )}

      {/* Featured image (left) + infinite scrolling feed (right) */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1.5fr]">
          {/* Left: big featured image */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {lead && (
              <Link
                href={`/news/${lead.id}`}
                className="group relative block overflow-hidden rounded-3xl border border-white/10 lg:aspect-[4/5]"
              >
                <div className="relative min-h-[380px] sm:min-h-[480px] lg:min-h-0">
                  <img
                    src={resolveImage(lead.image)}
                    alt={lead.title}
                    className="img-zoom absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                  <div className="relative flex h-full min-h-[380px] flex-col justify-end p-6 sm:min-h-[480px] sm:p-8 lg:min-h-0">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded-full bg-[#e31b23] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                        {lead.category}
                      </span>
                      {lead.breaking && (
                        <span className="animate-pulse rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/85 backdrop-blur-md">
                          Breaking
                        </span>
                      )}
                    </div>
                    <h2 className="font-display text-3xl font-semibold uppercase leading-tight tracking-wide text-white transition group-hover:text-[#ff5a5a] sm:text-4xl">
                      {lead.title}
                    </h2>
                    <p className="mt-3 line-clamp-2 text-sm text-white/60">
                      {lead.excerpt}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/50">
                      <span>{lead.author}</span>
                      <span>{timeAgo(lead.publishedAt)}</span>
                      <span className="flex items-center gap-1">
                        <View className="size-3.5" /> {formatViews(lead.views)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* Right: infinite scrolling feed */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-6 w-1 rounded-full bg-[#e31b23]" />
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#e31b23]">
                Latest Stories
              </p>
            </div>
            <div className="mt-6">
              <NewsInfiniteFeed articles={latestNews} />
            </div>
          </div>
        </div>
      </section>

      {/* Most read */}
      <section className="border-t border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-16 lg:px-8">
          <SectionHeading
            subtitle="Trending"
            title="Most Read This Week"
            description="The stories everyone is talking about right now."
          />
          <div className="mt-10 space-y-3">
            {latestNews
              .slice()
              .sort((a, b) => b.views - a.views)
              .slice(0, 5)
              .map((article, i) => (
                <Link
                  key={article.id}
                  href={`/news/${article.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-[#111111] p-4 transition hover:border-[#e31b23]/40"
                >
                  <span className="font-display text-4xl font-bold text-white/15 group-hover:text-[#e31b23]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e31b23]">
                      {article.category}
                    </p>
                    <h3 className="mt-1 line-clamp-1 font-display text-base font-semibold uppercase tracking-wide text-white">
                      {article.title}
                    </h3>
                    <p className="mt-1 flex items-center gap-3 text-xs text-white/45">
                      <span className="flex items-center gap-1">
                        <View className="size-3" /> {formatViews(article.views)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="size-3" /> {formatViews(article.comments)}
                      </span>
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
