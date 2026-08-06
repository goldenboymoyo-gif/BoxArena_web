import Link from "next/link";
import {
  ArrowRight,
  Award,
  CalendarDays,
  Crown,
  Flag,
  Gauge,
  MapPin,
  Play,
  Ruler,
  Scale,
  ShieldCheck,
  Star,
  Ticket,
  Trophy,
  Tv,
  Weight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Countdown } from "@/components/site/Countdown";
import { FighterCard } from "@/components/cards/FighterCard";
import { EventCard } from "@/components/cards/EventCard";
import { NewsCard } from "@/components/cards/NewsCard";
import { VideoCard } from "@/components/cards/VideoCard";
import { getFighter, legends } from "@/data/fighters";
import { events, heroEvent, liveEvent, completedEvents } from "@/data/events";
import { featuredNews, latestNews } from "@/data/news";
import { featuredVideos, videos } from "@/data/videos";
import { divisions } from "@/data/rankings";

const p4pIds = ["oleksandr-usyk", "terence-crawford", "naoya-inoue", "canelo-alvarez", "dmitry-bivol"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

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
  const rankedFighters = divisions.reduce((n, d) => n + d.rows.length, 0);
  const fightHour = heroEvent.time.split(":")[0];

  return (
    <div className="text-white">
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden border-b border-white/10">
        {/* Background: stadium, kept visible, only dimmed where the text sits */}
        <img
          src={heroEvent.posterImage}
          alt="Wembley Stadium"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-45"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.55),rgba(8,8,8,0.4)_55%,#080808_97%)]" />
        <div className="absolute inset-y-0 left-0 hidden w-2/3 bg-gradient-to-r from-[#080808]/95 via-[#080808]/60 to-transparent lg:block" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_15%,rgba(227,27,35,0.16),transparent_65%)]" />

        <div className="relative mx-auto max-w-[1440px] px-6 py-20 lg:px-8">
          {/* Event badges */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e31b23]/40 bg-[#e31b23]/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-[#ff6a6a]">
              <Award className="size-4" /> The Rematch · Dec 5
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-white/75 backdrop-blur-md">
              <MapPin className="size-4 text-[#e31b23]" /> Wembley Stadium · London
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c518]/40 bg-[#f5c518]/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-[#f5c518]">
              <Ticket className="size-4" /> {heroEvent.ticketStatus}
            </span>
          </div>

          <div className="mt-12 grid items-center gap-14 lg:grid-cols-[1.05fr_auto_1fr]">
            {/* ---------- LEFT: headline, story, countdown, CTAs ---------- */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.34em] text-[#e31b23]">
                Heavyweight Championship
              </p>

              <h1 className="mt-4 font-display font-bold uppercase leading-[0.92] tracking-tight text-white">
                <span className="block text-6xl sm:text-7xl xl:text-8xl">Joshua</span>
                <span className="my-2 flex items-center gap-4 text-xl text-[#e31b23] sm:text-2xl">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#e31b23]/70" />
                  VS
                  <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#e31b23]/70" />
                </span>
                <span className="block text-6xl text-stroke sm:text-7xl xl:text-8xl">Fury</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">
                The rivalry reaches its final chapter. Anthony Joshua and Tyson Fury
                collide for the biggest night in British boxing history — a 90,000
                crowd at Wembley, every title the sport has to offer, and one winner.
                The rematch the world demanded.
              </p>

              {/* Premium fight-night countdown card */}
              <div className="mt-8 max-w-xl overflow-hidden rounded-2xl border border-white/12 bg-[#0d0d0d]/85 backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-5 py-3">
                  <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.26em] text-white/70">
                    <Trophy className="size-4 text-[#e31b23]" /> Fight Night
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-[#e31b23] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                    <span className="size-1.5 animate-pulse rounded-full bg-white" />
                    {heroEvent.ticketStatus}
                  </span>
                </div>
                <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <Countdown date={`${heroEvent.date}T${fightHour}:00:00`} />
                  <div className="shrink-0 border-white/10 sm:border-l sm:pl-5">
                    <p className="font-display text-base font-semibold uppercase tracking-wide text-white">
                      {formatShortDate(heroEvent.date)}
                    </p>
                    <p className="mt-0.5 text-xs text-white/50">
                      {heroEvent.venue}, London · {heroEvent.time}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="rounded-full bg-[#e31b23] px-8 py-4 font-display text-sm font-bold uppercase tracking-[0.18em] text-white shadow-[0_18px_50px_rgba(227,27,35,0.35)] hover:bg-[#c3161d]"
                >
                  <Ticket className="size-4" /> Get Tickets
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/20 bg-black/40 px-8 py-4 font-display text-sm font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md hover:border-[#e31b23]/50 hover:bg-white/10"
                >
                  <Play className="size-4 fill-current text-[#e31b23]" /> Watch Live
                </Button>
              </div>
            </div>

            {/* ---------- CENTER: the fighters, face to face ---------- */}
            <div className="relative flex items-center justify-center lg:py-4">
              <div className="absolute inset-0 -z-0 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(227,27,35,0.22),transparent_70%)]" />

              {/* Joshua — left */}
              {heroJoshua && (
                <Link
                  href={`/fighters/${heroJoshua.id}`}
                  className="group relative z-10 -rotate-3 transition-transform duration-300 hover:-translate-y-2 hover:rotate-0"
                >
                  <div className="w-[160px] overflow-hidden rounded-[22px] border-2 border-[#e31b23]/70 shadow-[0_30px_70px_rgba(0,0,0,0.65)] sm:w-[210px] lg:w-[240px]">
                    <img
                      src={heroJoshua.image}
                      alt="Anthony Joshua"
                      className="img-zoom h-[240px] w-full object-cover object-top sm:h-[320px] lg:h-[390px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                  </div>
                  <div className="relative mt-3 text-left">
                    <p className="font-display text-xl font-bold uppercase tracking-wide text-white sm:text-2xl">
                      Joshua
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-white/55">
                      <Flag className="size-3.5 text-[#e31b23]" /> GB · {heroJoshua.record.wins}-{heroJoshua.record.losses}-{heroJoshua.record.draws}
                      <span className="text-[#e31b23]">({heroJoshua.record.kos} KO)</span>
                    </p>
                  </div>
                </Link>
              )}

              {/* VS medallion + belts */}
              <div className="relative z-20 -mx-3 flex flex-col items-center sm:-mx-6">
                <div className="grid size-20 place-items-center rounded-full border-4 border-[#0a0a0a] bg-gradient-to-br from-[#e31b23] to-[#8c0f14] shadow-[0_0_60px_rgba(227,27,35,0.55)] sm:size-24">
                  <span className="font-display text-2xl font-bold uppercase tracking-wider text-white sm:text-3xl">
                    VS
                  </span>
                </div>
                <div className="mt-5 hidden flex-col gap-2 sm:flex">
                  {heroEvent.titles.map((belt) => (
                    <span
                      key={belt}
                      className="flex items-center gap-1.5 rounded-full border border-[#f5c518]/35 bg-black/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#f5c518] backdrop-blur-md"
                    >
                      <Crown className="size-3.5" /> {belt}
                    </span>
                  ))}
                  <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/70 backdrop-blur-md">
                    <Scale className="size-3.5 text-[#e31b23]" /> {heroEvent.weightClass}
                  </span>
                </div>
              </div>

              {/* Fury — right */}
              {heroFury && (
                <Link
                  href={`/fighters/${heroFury.id}`}
                  className="group relative z-10 rotate-3 transition-transform duration-300 hover:-translate-y-2 hover:rotate-0"
                >
                  <div className="relative w-[160px] overflow-hidden rounded-[22px] border-2 border-[#f5c518]/70 shadow-[0_30px_70px_rgba(0,0,0,0.65)] sm:w-[210px] lg:w-[240px]">
                    <img
                      src={heroFury.image}
                      alt="Tyson Fury"
                      className="img-zoom h-[240px] w-full object-cover object-top sm:h-[320px] lg:h-[390px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                  </div>
                  <div className="relative mt-3 text-right">
                    <p className="font-display text-xl font-bold uppercase tracking-wide text-white sm:text-2xl">
                      Fury
                    </p>
                    <p className="flex items-center justify-end gap-1.5 text-xs text-white/55">
                      <Flag className="size-3.5 text-[#f5c518]" /> GB · {heroFury.record.wins}-{heroFury.record.losses}-{heroFury.record.draws}
                      <span className="text-[#e31b23]">({heroFury.record.kos} KO)</span>
                    </p>
                  </div>
                </Link>
              )}
            </div>

            {/* ---------- RIGHT: fight information card ---------- */}
            <div className="rounded-3xl border border-white/12 bg-[#0d0d0d]/85 p-6 backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/60">
                  Fight Info
                </p>
                <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-400">
                  {heroEvent.status}
                </span>
              </div>

              <div className="mt-5 space-y-3.5">
                {[
                  { icon: CalendarDays, label: "Date", value: `${formatDate(heroEvent.date)} · ${heroEvent.time}` },
                  { icon: MapPin, label: "Venue", value: `${heroEvent.venue}, London` },
                  { icon: Tv, label: "Broadcast", value: heroEvent.broadcaster },
                  { icon: Weight, label: "Weight Class", value: heroEvent.weightClass },
                  { icon: Gauge, label: "Rankings", value: `#${heroFury?.rank} vs #${heroJoshua?.rank} · Heavyweight` },
                  { icon: ShieldCheck, label: "Co-Main", value: heroEvent.coMain },
                ].map((row) => (
                  <div key={row.label} className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5">
                      <row.icon className="size-4 text-[#e31b23]" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                        {row.label}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-white/85">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tale of the tape */}
              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.26em] text-white/40">
                  <Ruler className="size-3.5 text-[#e31b23]" /> Tale of the Tape
                </p>
                <div className="mt-3 space-y-2">
                  {[
                    { label: "Record", a: `${heroJoshua?.record.wins}-${heroJoshua?.record.losses}-${heroJoshua?.record.draws}`, b: `${heroFury?.record.wins}-${heroFury?.record.losses}-${heroFury?.record.draws}` },
                    { label: "KOs", a: `${heroJoshua?.record.kos}`, b: `${heroFury?.record.kos}` },
                    { label: "Height", a: heroJoshua?.heightFt ?? "", b: heroFury?.heightFt ?? "" },
                    { label: "Reach", a: heroJoshua?.reachIn ?? "", b: heroFury?.reachIn ?? "" },
                    { label: "Stance", a: heroJoshua?.stance ?? "", b: heroFury?.stance ?? "" },
                  ].map((row) => (
                    <div key={row.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm">
                      <span className="text-right font-semibold text-white">{row.a}</span>
                      <span className="text-center text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
                        {row.label}
                      </span>
                      <span className="font-semibold text-white">{row.b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="mt-5 w-full rounded-full border border-[#e31b23]/50 bg-[#e31b23]/10 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#e31b23]">
                View fight card
              </button>
            </div>
          </div>

          {/* Real, data-backed metrics */}
          <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4">
            {[
              { label: "Upcoming Events", value: String(events.length), sub: "Live schedule" },
              { label: "Divisions Ranked", value: String(divisions.length), sub: "Full tables" },
              { label: "Ranked Fighters", value: String(rankedFighters), sub: "World class" },
              { label: "World Champions", value: String(divisions.length), sub: "Across divisions" },
            ].map((s) => (
              <div key={s.label} className="bg-[#0d0d0d] p-6 text-center">
                <p className="font-display text-3xl font-bold text-white">{s.value}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#e31b23]">
                  {s.label}
                </p>
                <p className="mt-0.5 text-[11px] text-white/40">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
              <div
                key={legend.name}
                className="group relative w-64 shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10"
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- NEWSLETTER CTA ---------------- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(80%_100%_at_50%_0%,rgba(227,27,35,0.22),transparent_60%)]" />
        <div className="relative mx-auto flex max-w-[1440px] flex-col items-center gap-6 px-6 py-24 text-center lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-white/70">
            <Star className="size-4 text-[#e31b23] fill-[#e31b23]" />
            Join the inner circle
          </span>
          <h2 className="max-w-3xl font-display text-4xl font-semibold uppercase tracking-wide text-white sm:text-5xl">
            Get fight night alerts before anyone else
          </h2>
          <p className="max-w-xl text-sm leading-7 text-white/55">
            Breaking news, presale codes, and exclusive fight-night content. Zero
            spam, unsubscribe anytime.
          </p>
          <form className="flex w-full max-w-md gap-2">
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-3.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-[#e31b23]/60"
            />
            <Button className="shrink-0 rounded-full bg-[#e31b23] px-7 font-display text-sm font-bold uppercase tracking-[0.16em] text-white hover:bg-[#c3161d]">
              Subscribe
            </Button>
          </form>
          <p className="text-xs text-white/35">
            128,000+ fans already subscribed. Trusted by fight fans worldwide.
          </p>
        </div>
      </section>
    </div>
  );
}
