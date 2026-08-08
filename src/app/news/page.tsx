import Link from "next/link";
import { Flame, MessageCircle, View } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { NewsCard } from "@/components/cards/NewsCard";
import { NewsFeed } from "@/components/news/NewsFeed";
import { breakingNews, latestNews } from "@/data/news";
import { formatViews, timeAgo } from "@/lib/format";

export const metadata = {
  title: "Boxing News",
  description:
    "Breaking boxing news, fight announcements, results, interviews and analysis.",
};

export default function NewsPage() {
  const lead = latestNews[0];
  const featured = latestNews.slice(1, 4);

  return (
    <div className="text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(100%_120%_at_50%_-20%,rgba(227,27,35,0.25),transparent_55%)]" />
        <div className="relative mx-auto max-w-[1440px] px-6 py-10 sm:py-16 lg:px-8">
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
          <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-6 py-4 lg:px-8">
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

      {/* Top stories */}
      <section className="mx-auto max-w-[1440px] px-6 py-14 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          {lead && <NewsCard article={lead} variant="overlay" />}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {featured.map((article) => (
              <NewsCard key={article.id} article={article} variant="wide" />
            ))}
          </div>
        </div>
      </section>

      {/* All news */}
      <section className="border-t border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-8">
          <SectionHeading
            subtitle="Latest"
            title="All Stories"
            description="Filter the newsroom by category."
          />
          <div className="mt-10">
            <NewsFeed articles={latestNews} />
          </div>
        </div>
      </section>

      {/* Most read */}
      <section className="mx-auto max-w-[1440px] px-6 py-16 lg:px-8">
        <div className="grid gap-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-6 w-1 rounded-full bg-[#e31b23]" />
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#e31b23]">
                Trending
              </p>
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide text-white">
              Most Read This Week
            </h2>
            <div className="mt-6 space-y-3">
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
        </div>
      </section>
    </div>
  );
}
