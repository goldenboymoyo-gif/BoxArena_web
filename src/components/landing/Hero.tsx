"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight, MapPin, Play, Ticket } from "lucide-react";
import { Countdown } from "@/components/site/Countdown";
import { events } from "@/data/events";
import { getFighterByName } from "@/data/fighters";
import { IMAGES } from "@/data/images";
import { cn } from "@/lib/utils";
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

const HERO_BACKGROUND_OVERRIDES: Record<string, string> = {
  "fury-vs-joshua-2":
    "https://upload.wikimedia.org/wikipedia/commons/3/35/Joshua_vs_Pulev_02_Arena_London.png",
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

function recordString(name: string) {
  const f = getFighterByName(name);
  if (!f) return "";
  const { wins, losses, draws, kos } = f.record;
  return `${wins}-${losses}-${draws} (${kos} KO)`;
}

const fade = { duration: 0.5, ease: "easeOut" as const };

interface FightCarouselProps {
  fights: BoxingEvent[];
  active: number;
  onSelect: (index: number) => void;
}

function FightCarousel({ fights, active, onSelect }: FightCarouselProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/50 shadow-[0_30px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-3">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.26em] text-white/70">
          <span className="size-1.5 rounded-full bg-[#e31b23]" /> Upcoming Fights
        </p>
        <span className="hidden items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 sm:flex">
          Scroll <ChevronRight className="size-3.5" />
        </span>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto p-3">
        {fights.map((f, i) => {
          const fa = getFighterByName(f.fighterA);
          const fb = getFighterByName(f.fighterB);
          const isActive = i === active;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelect(i)}
              className={cn(
                "group flex shrink-0 cursor-pointer items-center gap-3 rounded-2xl border p-2.5 pr-5 text-left transition",
                isActive
                  ? "border-[#e31b23]/70 bg-[#e31b23]/10 shadow-[0_0_28px_rgba(227,27,35,0.35)]"
                  : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10"
              )}
            >
              <span className="relative block h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/10">
                <img
                  src={fa?.image ?? f.imageA}
                  alt=""
                  className="absolute inset-y-0 left-0 w-1/2 object-cover object-top"
                />
                <span className="absolute inset-y-0 left-1/2 w-px bg-[#e31b23]/80" />
                <img
                  src={fb?.image ?? f.imageB}
                  alt=""
                  className="absolute inset-y-0 right-0 w-1/2 object-cover object-top"
                />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 font-display text-sm font-bold uppercase tracking-wide text-white">
                  <span className="truncate">{shortName(f.fighterA)}</span>
                  <span className="shrink-0 text-xs font-black text-[#e31b23]">VS</span>
                  <span className="truncate text-white/75">{shortName(f.fighterB)}</span>
                </span>
                <span className="mt-0.5 block truncate text-[10px] uppercase tracking-[0.16em] text-white/40">
                  {formatLongDate(f.date)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
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
  if (!event) return null;

  const hour = event.time.split(":")[0];
  const fighterA = getFighterByName(event.fighterA);
  const fighterB = getFighterByName(event.fighterB);
  const overrideA = fighterA ? HERO_IMAGE_OVERRIDES[fighterA.id] : undefined;
  const overrideB = fighterB ? HERO_IMAGE_OVERRIDES[fighterB.id] : undefined;
  const imageA = overrideA?.src ?? fighterA?.image ?? event.imageA;
  const imageB = overrideB?.src ?? fighterB?.image ?? event.imageB;
  const nameA = shortName(event.fighterA);
  const nameB = shortName(event.fighterB);
  const recordA = recordString(event.fighterA);
  const recordB = recordString(event.fighterB);
  const divShort =
    event.weightClass.match(/\(([^)]+)\)/)?.[1] ??
    event.weightClass.split(" (")[0];
  const bgSrc = HERO_BACKGROUND_OVERRIDES[event.id] ?? event.posterImage;

  return (
    <section
      className="relative overflow-x-clip border-b border-white/10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ---------- Arena backdrop with slow zoom ---------- */}
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence>
          <motion.img
            key={`bg-${event.id}`}
            src={bgSrc}
            alt=""
            className="h-full w-full object-cover object-center opacity-85"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
          />
        </AnimatePresence>
      </div>

      {/* Dark overlay + spotlights + red glow */}
      <div className="absolute inset-0 bg-[#0a0a0a]/60" />
      <div className="absolute inset-0 bg-[radial-gradient(45%_38%_at_16%_22%,rgba(90,150,255,0.22),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(45%_38%_at_84%_22%,rgba(235,240,255,0.14),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(55%_50%_at_50%_48%,rgba(227,27,35,0.16),transparent_62%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/70 via-transparent to-[#0a0a0a]" />

      {/* ================= MOBILE APP HERO ================= */}
      <div className="relative z-[2] mx-auto flex min-h-[calc(100dvh-7rem)] max-w-xl flex-col justify-center px-5 pb-36 pt-6 lg:hidden">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e31b23]/40 bg-[#e31b23]/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff6b6b]">
            <span className="size-1.5 rounded-full bg-[#e31b23]" />
            Next Event
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
            {formatLongDate(event.date)}
          </span>
        </div>

        {/* Matchup card */}
        <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-black/50 backdrop-blur-2xl">
          <div className="flex items-stretch gap-2 p-4">
            <div className="flex min-w-0 flex-1 flex-col items-center text-center">
              <img
                src={imageA}
                alt={event.fighterA}
                className="size-20 rounded-2xl border border-white/15 object-cover object-top shadow-lg"
              />
              <p className="mt-2.5 w-full truncate font-display text-xl font-bold uppercase leading-tight text-white">
                {nameA}
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
                {recordA}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-center justify-center px-1">
              <span className="font-display text-2xl font-black text-[#e31b23]">VS</span>
              <span className="mt-1.5 rounded-full bg-[#e31b23] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
                {divShort}
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-center text-center">
              <img
                src={imageB}
                alt={event.fighterB}
                className="size-20 rounded-2xl border border-white/15 object-cover object-top shadow-lg"
              />
              <p className="mt-2.5 w-full truncate font-display text-xl font-bold uppercase leading-tight text-white">
                {nameB}
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
                {recordB}
              </p>
            </div>
          </div>
        </div>

        {/* Countdown */}
        <div className="mt-5 flex justify-center">
          <Countdown date={`${event.date}T${hour}:00:00`} timezone={event.timezone} pill />
        </div>

        {/* Meta */}
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
          <MapPin className="size-3.5 shrink-0 text-[#e31b23]" />
          {event.venue}, {event.city.split(",")[0]}
        </p>

        {/* CTAs */}
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href={`/events/${event.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 font-display text-sm font-bold uppercase tracking-[0.18em] text-black transition active:scale-[0.98]"
          >
            <Ticket className="size-4 text-[#e31b23]" /> Get Tickets
          </Link>
          <Link
            href="/live"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-4 font-display text-sm font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md transition active:scale-[0.98]"
          >
            <Play className="size-4 fill-current text-[#e31b23]" /> Watch Live
          </Link>
        </div>
      </div>

      {/* ================= DESKTOP HERO ================= */}
      {/* Flanking fighters, anchored to the bottom behind the typography */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-10 z-[1] hidden h-[88vh] xl:block">
        {/* LEFT fighter */}
        <div className="absolute bottom-0 left-0 h-full w-[34%] xl:w-[30%] 2xl:w-[34%]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`fa-${event.id}`}
              className="absolute inset-0 [mask-image:linear-gradient(90deg,transparent_0%,black_32%),linear-gradient(to_top,transparent_16%,black_65%)]"
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={fade}
            >
              <motion.img
                src={imageA}
                alt={event.fighterA}
                className="h-full w-full -scale-x-100 object-cover object-top drop-shadow-[0_30px_50px_rgba(0,0,0,0.75)]"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#0a0a0a]/95 via-[#0a0a0a]/40 to-transparent" />
        </div>

        {/* RIGHT fighter */}
        <div className="absolute bottom-0 right-0 h-full w-[34%] xl:w-[30%] 2xl:w-[34%]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`fb-${event.id}`}
              className="absolute inset-0 [mask-image:linear-gradient(90deg,black_68%,transparent_100%),linear-gradient(to_top,transparent_16%,black_65%)]"
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 28 }}
              transition={fade}
            >
              <motion.img
                src={imageB}
                alt={event.fighterB}
                className="h-full w-full object-cover object-top drop-shadow-[0_30px_50px_rgba(0,0,0,0.75)]"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#0a0a0a]/95 via-[#0a0a0a]/40 to-transparent" />
        </div>
      </div>

      {/* CENTER: the focal point */}
      <div className="relative z-[2] hidden min-h-[88vh] items-center justify-center px-6 pb-40 pt-10 lg:flex lg:px-8 lg:pt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={`center-${event.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={fade}
            className="flex w-full max-w-xl flex-col items-center px-2 text-center 2xl:max-w-lg"
          >
            {/* Countdown panel */}
            <div className="rounded-full border border-white/10 bg-black/45 px-6 py-3.5 backdrop-blur-xl sm:px-8 sm:py-4">
              <Countdown
                date={`${event.date}T${hour}:00:00`}
                timezone={event.timezone}
                pill
              />
            </div>

            {/* Fight title */}
            <h1 className="mt-9 font-display font-black uppercase leading-[0.88] tracking-tight">
              <span className="block bg-gradient-to-b from-white via-white/90 to-white/35 bg-clip-text text-6xl text-transparent sm:text-7xl xl:text-8xl">
                {nameA}
              </span>
              <span className="my-1 block bg-gradient-to-b from-[#ff4d52] via-[#e31b23] to-[#8f0e13] bg-clip-text text-7xl leading-none text-transparent sm:text-8xl xl:text-[9rem]">
                VS
              </span>
              <span className="block bg-gradient-to-b from-white via-white/90 to-white/35 bg-clip-text text-6xl text-transparent sm:text-7xl xl:text-8xl">
                {nameB}
              </span>
            </h1>

            {/* Event info */}
            <p className="mt-8 font-display text-lg font-semibold uppercase tracking-[0.18em] text-white sm:text-xl">
              {formatLongDate(event.date)}
            </p>
            <p className="mt-1.5 text-xs font-bold uppercase tracking-[0.3em] text-white/50">
              {event.venue}, {event.city} · {event.weightClass}
            </p>

            {/* CTAs */}
            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href={`/events/${event.id}`}
                className="inline-flex items-center gap-2.5 rounded-full bg-white px-9 py-4 font-display text-sm font-bold uppercase tracking-[0.18em] text-black transition hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_16px_44px_rgba(255,255,255,0.28)]"
              >
                <Ticket className="size-4 text-[#e31b23]" /> Get Tickets
              </Link>
              <Link
                href="/live"
                className="inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-white/5 px-9 py-4 font-display text-sm font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#e31b23]/60 hover:bg-white/10"
              >
                <Play className="size-4 fill-current text-[#e31b23]" /> Watch Live
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ---------- Bottom fight carousel, overlapping the hero ---------- */}
      <div className="relative z-10 mx-auto -mt-24 max-w-[1600px] px-6 pb-4 lg:-mt-28 lg:px-8">
        <FightCarousel fights={heroEvents} active={index} onSelect={setIndex} />
      </div>
    </section>
  );
}
