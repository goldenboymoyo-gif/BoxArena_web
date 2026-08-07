"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Play, Ticket } from "lucide-react";
import { Countdown } from "@/components/site/Countdown";
import { FightCard } from "@/components/cards/FightCard";
import { events } from "@/data/events";
import { divisions } from "@/data/rankings";
import { getFighterByName } from "@/data/fighters";
import { IMAGES } from "@/data/images";
import type { BoxingEvent } from "@/data/types";

const HERO_IDS = [
  "fury-vs-joshua-2",
  "canelo-vs-crawford",
  "usyk-vs-zhang",
  "dubois-vs-parker",
  "bivol-vs-beterbiev-3",
  "shakur-vs-davis",
  "lopez-vs-haney",
];

const ROTATE_MS = 20000;

const HERO_IMAGE_OVERRIDES: Record<string, { src: string; position: string }> = {
  "anthony-joshua": { src: IMAGES.fighters.joshuaFight, position: "object-center" },
  "tyson-fury": { src: IMAGES.fighters.furyFight, position: "object-top" },
};

const HERO_BLURBS: Record<string, string> = {
  "fury-vs-joshua-2":
    "The rivalry reaches its final chapter. Anthony Joshua and Tyson Fury collide for the biggest night in British boxing history — a 90,000 crowd at Wembley, every title the sport has to offer, and one winner.",
  "canelo-vs-crawford":
    "The two best pound-for-pound fighters of this era finally share a ring. Canelo's power against Crawford's switch-hitting genius in the biggest super fight the sport has ever made.",
  "usyk-vs-zhang":
    "Two heavyweight champions meet in the desert. Usyk's ring craft against Zhang's one-punch power — unification night in Riyadh.",
  "dubois-vs-parker":
    "The IBF world title is on the line as the division's hardest puncher meets one of its toughest operators. London, live on Sky Sports.",
  "bivol-vs-beterbiev-3":
    "The trilogy decider. Undisputed champion Dmitry Bivol and the knockout king Artur Beterbiev settle the light heavyweight rivalry once and for all.",
  "shakur-vs-davis":
    "Speed against dynamite at 135 pounds. WBC champion Shakur Stevenson and WBA king Gervonta Davis meet for lightweight supremacy in Newark.",
  "lopez-vs-haney":
    "The most personal rivalry in boxing boils over at Madison Square Garden. Teofimo Lopez and Devin Haney unify the super lightweight division.",
};

function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function shortName(full: string) {
  return full.split(" ").slice(-1)[0];
}

const fade = { duration: 0.5, ease: "easeOut" as const };

interface Stat {
  label: string;
  value: number;
  sub: string;
}

function StatCell({ stat, inView }: { stat: Stat; inView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const duration = 1100;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * stat.value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, stat.value]);

  return (
    <div className="flex flex-col items-center justify-center px-2 py-5">
      <span className="font-display text-5xl font-bold leading-none tabular-nums text-white">
        {count}
      </span>
      <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#e31b23]">
        {stat.label}
      </span>
      <span className="mt-1 text-[10px] text-white/35">{stat.sub}</span>
    </div>
  );
}

function StatsBand() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const stats: Stat[] = useMemo(
    () => [
      { label: "Upcoming Events", value: events.length, sub: "Live schedule" },
      { label: "Divisions Ranked", value: divisions.length, sub: "Full tables" },
      {
        label: "Ranked Fighters",
        value: divisions.reduce((n, d) => n + d.rows.length, 0),
        sub: "World class",
      },
      { label: "World Champions", value: divisions.length, sub: "Across divisions" },
    ],
    []
  );

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4"
    >
      {stats.map((s) => (
        <div key={s.label} className="bg-[#0d0d0d]">
          <StatCell stat={s} inView={inView} />
        </div>
      ))}
    </div>
  );
}

export function Hero() {
  const heroEvents = useMemo(
    () =>
      HERO_IDS.map((id) => events.find((e) => e.id === id)).filter(
        (e): e is BoxingEvent => Boolean(e)
      ),
    []
  );
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || heroEvents.length < 2) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % heroEvents.length),
      ROTATE_MS
    );
    return () => clearInterval(id);
  }, [heroEvents.length, paused]);

  const event = heroEvents[index];
  const fighterA = event ? getFighterByName(event.fighterA) : undefined;

  if (!event) return null;

  const overrideA = fighterA ? HERO_IMAGE_OVERRIDES[fighterA.id] : undefined;
  const imageA = overrideA?.src ?? fighterA?.image ?? event.imageA;
  const hour = event.time.split(":")[0];

  return (
    <section
      className="relative overflow-hidden border-b border-white/10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Backdrop: the headline fighter, deep in the dark */}
      <AnimatePresence>
        <motion.img
          key={`bg-${event.id}`}
          src={imageA}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top opacity-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,7,7,0.82),rgba(7,7,7,0.55)_55%,#080808_97%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_10%,rgba(227,27,35,0.16),transparent_65%)]" />

      <div className="relative mx-auto max-w-[1440px] px-6 py-16 lg:px-8 lg:py-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          {/* ---------- LEFT: one story, in order ---------- */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`left-${event.id}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={fade}
              className="max-w-2xl"
            >
              <span className="inline-flex items-center gap-2.5 rounded-full border border-[#e31b23]/40 bg-[#e31b23]/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3em] text-[#e31b23]">
                <span className="size-1.5 animate-pulse rounded-full bg-[#e31b23]" />
                {event.headline}
              </span>

              <h1 className="mt-7 font-display font-bold uppercase leading-[0.9] tracking-tight text-white">
                <span className="block text-6xl sm:text-7xl xl:text-8xl">
                  {shortName(event.fighterA)}
                </span>
                <span className="my-3 flex items-center gap-5 text-xl text-[#e31b23] sm:text-2xl">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#e31b23]/70" />
                  VS
                  <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#e31b23]/70" />
                </span>
                <span className="block text-6xl text-stroke sm:text-7xl xl:text-8xl">
                  {shortName(event.fighterB)}
                </span>
              </h1>

              <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-lg font-semibold uppercase tracking-wide text-white">
                <span className="inline-flex items-center gap-2 text-white">
                  <CalendarDays className="size-5 text-[#e31b23]" />
                  {formatLongDate(event.date)}
                </span>
                <span className="text-white/35">·</span>
                <span className="inline-flex items-center gap-2 text-white/70">
                  <MapPin className="size-5 text-[#e31b23]" />
                  {event.venue}, {event.city}
                </span>
              </p>

              <p className="mt-6 hidden max-w-xl text-base leading-7 text-white/60 sm:block">
                {HERO_BLURBS[event.id]}
              </p>

              <div className="mt-9">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/45">
                  Fight night in
                </p>
                <div className="mt-3">
                  <Countdown
                    date={`${event.date}T${hour}:00:00`}
                    timezone={event.timezone}
                  />
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href={`/events/${event.id}`}
                  className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#e31b23] px-10 py-5 font-display text-base font-bold text-white shadow-[0_12px_44px_-12px_rgba(227,27,35,0.75)] transition hover:bg-[#c3161d]"
                >
                  <Ticket className="size-5" /> Get Tickets
                </Link>
                <Link
                  href="/live"
                  className="inline-flex items-center justify-center gap-2.5 rounded-full border border-white/25 bg-black/40 px-10 py-5 font-display text-base font-bold text-white backdrop-blur-md transition hover:border-[#e31b23]/60 hover:bg-white/10"
                >
                  <Play className="size-5 fill-current text-[#e31b23]" /> Watch Live
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ---------- RIGHT: single large poster ---------- */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`poster-${event.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={fade}
              className="relative hidden lg:block"
            >
              <div className="relative overflow-hidden rounded-3xl border border-white/10">
                <img
                  src={imageA}
                  alt={event.title}
                  className={`img-zoom h-[520px] w-full object-cover xl:h-[580px] ${
                    overrideA?.position ?? "object-top"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/20" />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/55">
                    {event.weightClass} · {event.titles.join(" · ")}
                  </p>
                  <h3 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide text-white">
                    {shortName(event.fighterA)}{" "}
                    <span className="text-[#e31b23]">vs</span>{" "}
                    {shortName(event.fighterB)}
                  </h3>
                  <p className="mt-1 text-sm text-white/55">
                    {event.venue} · {formatLongDate(event.date)}
                  </p>
                  <Link
                    href={`/events/${event.id}`}
                    className="group mt-5 inline-flex items-center gap-2 rounded-full bg-[#e31b23] px-7 py-3.5 font-display text-sm font-bold text-white transition hover:bg-[#c3161d]"
                  >
                    Get Tickets{" "}
                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ---------- FULL FIGHT CARD ---------- */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`card-${event.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={fade}
            className="mt-14"
          >
            <FightCard
              card={event.card}
              eventId={event.id}
              eventTitle={event.title}
            />
          </motion.div>
        </AnimatePresence>

        {/* Fight selector */}
        <div className="mt-10 flex items-center justify-center gap-2">
          {heroEvents.map((e, i) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${e.title}`}
              className={
                i === index
                  ? "h-1.5 w-8 rounded-full bg-[#e31b23] transition-all duration-300"
                  : "h-1.5 w-1.5 rounded-full bg-white/25 transition-all duration-300 hover:bg-white/60"
              }
            />
          ))}
        </div>

        {/* Real, data-backed metrics */}
        <div className="mt-10 hidden sm:block">
          <StatsBand />
        </div>
      </div>
    </section>
  );
}
