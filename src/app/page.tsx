import Link from "next/link";
import { ArrowRight, ArrowUpRight, Play } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Hero } from "@/components/landing/Hero";
import { Newsletter } from "@/components/site/Newsletter";
import { StatsBand } from "@/components/landing/StatsBand";
import { FighterCard } from "@/components/cards/FighterCard";
import { EventCard } from "@/components/cards/EventCard";
import { NewsCard } from "@/components/cards/NewsCard";
import { VideoCard } from "@/components/cards/VideoCard";
import { getFighter, legends } from "@/data/fighters";
import { events, heroEvent, liveEvent, completedEvents } from "@/data/events";
import { featuredNews, latestNews } from "@/data/news";
import { featuredVideos, videos } from "@/data/videos";

const p4pIds = ["oleksandr-usyk", "terence-crawford", "naoya-inoue", "canelo-alvarez", "dmitry-bivol"];

export default function Home() {
  const p4p = p4pIds.map((id) => getFighter(id)).filter(Boolean).slice(0, 5);
  const heroFury = getFighter("tyson-fury");
  const heroJoshua = getFighter("anthony-joshua");
  const upcoming = events.slice(0, 4);
  const breaking = latestNews.slice(0, 3);
  const leadNews = featuredNews[0];
  const sideNews = latestNews.slice(1, 4);
  const leadVideo = featuredVideos[0];
  const sideVideos = videos.slice(1, 5);

  return (
    <div className="text-white">
      {/* ---------------- HERO ---------------- */}
      <Hero />

      {/* ---------------- PLATFORM STATISTICS ---------------- */}
      <StatsBand />

      {/* ---------------- UPCOMING EVENTS ---------------- */}
      <section className="mx-auto max-w-[1440px] px-6 py-20 lg:px-8">
        <SectionHeading
          subtitle="Fight Schedule"
          title="Upcoming Events"
          description="Every championship, every showdown, every night of action across the globe."
          actionLabel="View all events"
          actionHref="/events"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {upcoming.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* ---------------- POUND-FOR-POUND ---------------- */}
      <section className="border-y border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto max-w-[1440px] px-6 py-20 lg:px-8">
          <SectionHeading
            subtitle="The Elite"
            title="Pound-for-Pound Top 5"
            description="The five greatest fighters on the planet, ranked by our editorial panel."
            actionLabel="Full rankings"
            actionHref="/rankings"
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {p4p.map((fighter) =>
              fighter ? <FighterCard key={fighter.id} fighter={fighter} /> : null
            )}
          </div>
        </div>
      </section>

      {/* ---------------- LATEST NEWS ---------------- */}
      <section className="mx-auto max-w-[1440px] px-6 py-20 lg:px-8">
        <SectionHeading
          subtitle="Inside the Ring"
          title="Latest News"
          description="Breaking stories, fight reports and features from the world of boxing."
          actionLabel="All news"
          actionHref="/news"
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="grid gap-6">
            {leadNews && <NewsCard article={leadNews} variant="overlay" />}
            <div className="grid gap-6 sm:grid-cols-2">
              {breaking.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            {sideNews.map((article) => (
              <NewsCard key={article.id} article={article} variant="wide" />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- LIVE NOW / TALE OF THE TAPE ---------------- */}
      <section className="border-y border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto max-w-[1440px] px-6 py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div className="relative overflow-hidden rounded-2xl border border-white/10">
              <img
                src={liveEvent.posterImage}
                alt={liveEvent.title}
                className="img-zoom h-[420px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#e31b23] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                  <span className="relative flex size-2">
                    <span className="live-dot inline-flex size-2 rounded-full bg-white" />
                  </span>
                  Live Now
                </span>
                <h3 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide text-white">
                  {liveEvent.title}
                </h3>
                <p className="mt-1 text-sm text-white/60">
                  {liveEvent.venue} · {liveEvent.city}
                </p>
                <Link
                  href="/live"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#e31b23] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#c3161d]"
                >
                  <Play className="size-3.5 fill-current" /> Watch Live
                </Link>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="h-6 w-1 rounded-full bg-[#e31b23]" />
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#e31b23]">
                  Tale of the Tape
                </p>
              </div>
              <h2 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide text-white sm:text-4xl">
                {heroEvent.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/55">
                Two champions, one destiny. Comparing the heavyweights who headline
                the biggest fight of the year.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {heroFury && heroJoshua && (
                  <>
                    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
                      <img src={heroFury.image} alt={heroFury.name} className="h-20 w-20 rounded-full border-2 border-[#e31b23] object-cover object-top" />
                      <h4 className="mt-3 font-display text-xl font-semibold uppercase text-white">{heroFury.name}</h4>
                      <p className="text-sm text-white/50">34-2-1 (24 KO)</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
                      <img src={heroJoshua.image} alt={heroJoshua.name} className="h-20 w-20 rounded-full border-2 border-white/40 object-cover object-top" />
                      <h4 className="mt-3 font-display text-xl font-semibold uppercase text-white">{heroJoshua.name}</h4>
                      <p className="text-sm text-white/50">29-4-0 (26 KO)</p>
                    </div>
                  </>
                )}
              </div>
              <Link
                href={`/events/${heroEvent.id}`}
                className="group mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:border-[#e31b23]/50 hover:text-white"
              >
                View full tale of the tape
                <ArrowRight className="size-4 text-[#e31b23] transition group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- VIDEOS ---------------- */}
      <section className="mx-auto max-w-[1440px] px-6 py-20 lg:px-8">
        <SectionHeading
          subtitle="Watch"
          title="Videos & Highlights"
          description="Full fights, press conferences, documentaries and tutorials."
          actionLabel="All videos"
          actionHref="/videos"
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-6">
            {leadVideo && <VideoCard video={leadVideo} />}
            {completedEvents.slice(0, 2).map((event) => (
              <EventCard key={event.id} event={event} variant="compact" />
            ))}
          </div>
          <div className="grid content-start gap-4">
            {sideVideos.map((video) => (
              <VideoCard key={video.id} video={video} variant="horizontal" />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- LEGENDS ---------------- */}
      <section className="border-y border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto max-w-[1440px] px-6 py-20 lg:px-8">
          <SectionHeading
            subtitle="The Greats"
            title="Boxing Legends"
            description="The immortals who built this sport — their records and legacies live on."
            actionLabel="Meet the legends"
            actionHref="/fighters#legends"
          />
          <div className="no-scrollbar mt-10 flex snap-x gap-6 overflow-x-auto pb-2">
            {legends.map((legend) => (
              <a
                key={legend.name}
                href={legend.wiki}
                target="_blank"
                rel="noreferrer"
                className="group relative w-64 shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 transition duration-300 hover:-translate-y-1 hover:border-[#e31b23]/45"
              >
                <img
                  src={legend.image}
                  alt={legend.name}
                  loading="lazy"
                  className="img-zoom h-80 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h4 className="font-display text-2xl font-semibold uppercase tracking-wide text-white">
                    {legend.name}
                  </h4>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/55">
                    {legend.era} · {legend.record}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70 backdrop-blur-md transition group-hover:border-[#e31b23]/60 group-hover:text-white">
                    Meet the legend
                    <ArrowUpRight className="size-3.5 text-[#e31b23] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- NEWSLETTER ---------------- */}
      <Newsletter />
    </div>
  );
}
