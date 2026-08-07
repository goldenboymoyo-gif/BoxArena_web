import Link from "next/link";
import { Search, SearchX } from "lucide-react";
import { EventCard } from "@/components/cards/EventCard";
import { FighterCard } from "@/components/cards/FighterCard";
import { NewsCard } from "@/components/cards/NewsCard";
import { VideoCard } from "@/components/cards/VideoCard";
import { events } from "@/data/events";
import { fighters } from "@/data/fighters";
import { latestNews } from "@/data/news";
import { videos } from "@/data/videos";

export const metadata = {
  title: "Search",
  description:
    "Search Ringcraft for fights, fighters, events, news and videos.",
};

function matches(
  q: string,
  ...fields: (string | string[] | undefined)[]
): boolean {
  const needle = q.toLowerCase();
  return fields.some((f) => {
    if (!f) return false;
    if (Array.isArray(f)) return f.some((x) => x.toLowerCase().includes(needle));
    return f.toLowerCase().includes(needle);
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const eventResults = query
    ? events.filter((e) =>
        matches(
          query,
          e.title,
          e.headline,
          e.fighterA,
          e.fighterB,
          e.venue,
          e.city,
          e.weightClass,
          e.coMain
        )
      )
    : [];
  const fighterResults = query
    ? fighters.filter((f) =>
        matches(
          query,
          f.name,
          f.nickname,
          f.division,
          f.titles,
          f.flagLabel,
          f.birthplace
        )
      )
    : [];
  const newsResults = query
    ? latestNews.filter((a) =>
        matches(query, a.title, a.excerpt, a.category, a.tags, a.author)
      )
    : [];
  const videoResults = query
    ? videos.filter((v) =>
        matches(query, v.title, v.description, v.category, v.tags)
      )
    : [];

  const total =
    eventResults.length +
    fighterResults.length +
    newsResults.length +
    videoResults.length;

  return (
    <div className="text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(100%_120%_at_50%_-20%,rgba(227,27,35,0.25),transparent_55%)]" />
        <div className="relative mx-auto max-w-[1440px] px-6 py-14 lg:px-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
            <Link href="/" className="transition hover:text-white">Home</Link>
            <span className="text-[#e31b23]">/</span>
            <span className="text-white/70">Search</span>
          </div>
          <h1 className="mt-4 flex items-center gap-3 font-display text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl">
            <Search className="size-8 text-[#e31b23]" />
            Search <span className="text-[#e31b23]">Results</span>
          </h1>
          {query ? (
            <p className="mt-4 text-sm text-white/55">
              {total} result{total === 1 ? "" : "s"} for{" "}
              <span className="font-semibold text-white">&ldquo;{query}&rdquo;</span>
            </p>
          ) : (
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
              Find fights, fighters, events, news and videos across the Ringcraft
              platform. Type a name, venue or division into the search bar above.
            </p>
          )}
        </div>
      </section>

      {!query ? (
        <section className="mx-auto max-w-[1440px] px-6 py-24 text-center lg:px-8">
          <Search className="mx-auto size-12 text-white/20" />
          <p className="mt-4 font-display text-2xl font-semibold uppercase tracking-wide text-white/70">
            Start typing to search
          </p>
          <p className="mt-2 text-sm text-white/45">
            Try &ldquo;Usyk&rdquo;, &ldquo;Madison Square Garden&rdquo; or &ldquo;Highlights&rdquo;.
          </p>
        </section>
      ) : total === 0 ? (
        <section className="mx-auto max-w-[1440px] px-6 py-24 text-center lg:px-8">
          <SearchX className="mx-auto size-12 text-white/20" />
          <p className="mt-4 font-display text-2xl font-semibold uppercase tracking-wide text-white/70">
            No results for &ldquo;{query}&rdquo;
          </p>
          <p className="mt-2 text-sm text-white/45">
            Check the spelling or try a broader term.
          </p>
        </section>
      ) : (
        <section className="mx-auto max-w-[1440px] px-6 py-14 lg:px-8">
          {eventResults.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold uppercase tracking-wide text-white">
                Events
              </h2>
              <div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {eventResults.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {fighterResults.length > 0 && (
            <div className="mt-14">
              <h2 className="font-display text-2xl font-semibold uppercase tracking-wide text-white">
                Fighters
              </h2>
              <div className="mt-5 grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-5">
                {fighterResults.map((fighter) => (
                  <FighterCard key={fighter.id} fighter={fighter} />
                ))}
              </div>
            </div>
          )}

          {newsResults.length > 0 && (
            <div className="mt-14">
              <h2 className="font-display text-2xl font-semibold uppercase tracking-wide text-white">
                News
              </h2>
              <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {newsResults.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          )}

          {videoResults.length > 0 && (
            <div className="mt-14">
              <h2 className="font-display text-2xl font-semibold uppercase tracking-wide text-white">
                Videos
              </h2>
              <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {videoResults.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
