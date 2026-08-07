"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Flag, Play, Ticket, Trophy } from "lucide-react";
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

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function shortName(full: string) {
  return full.split(" ").slice(-1)[0];
}

const fade = { duration: 0.5, ease: "easeOut" as const };

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
  const fighterB = event ? getFighterByName(event.fighterB) : undefined;
  const rankedFighters = useMemo(
    () => divisions.reduce((n, d) => n + d.rows.length, 0),
    []
  );

  if (!event) return null;

  const overrideA = fighterA ? HERO_IMAGE_OVERRIDES[fighterA.id] : undefined;
  const overrideB = fighterB ? HERO_IMAGE_OVERRIDES[fighterB.id] : undefined;
  const imageA = overrideA?.src ?? fighterA?.image ?? event.imageA;
  const imageB = overrideB?.src ?? fighterB?.image ?? event.imageB;
  const hour = event.time.split(":")[0];

  const recA = fighterA?.record;
  const recB = fighterB?.record;

  return (
    <section
      className="relative overflow-hidden border-b border-white/10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background: the fighters themselves, split across the frame */}
      <AnimatePresence>
        <motion.img
          key={`bg-a-${event.id}`}
          src={imageA}
          alt=""
          className="absolute inset-y-0 left-0 h-full w-full object-cover object-top opacity-45 sm:w-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        />
        <motion.img
          key={`bg-b-${event.id}`}
          src={imageB}
          alt=""
          className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover object-top opacity-45 sm:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.55),rgba(8,8,8,0.4)_55%,#080808_97%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_15%,rgba(227,27,35,0.16),transparent_65%)]" />

      <div className="relative mx-auto max-w-[1440px] px-6 py-14 lg:px-8 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* ---------- LEFT: headline, story, countdown, CTAs ---------- */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`left-${event.id}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={fade}
              className="max-w-2xl"
            >
              <p className="text-xs font-bold uppercase tracking-[0.34em] text-[#e31b23]">
                {event.headline}
              </p>

              <h1 className="mt-4 font-display font-bold uppercase leading-[0.92] tracking-tight text-white">
                <span className="block text-5xl sm:text-6xl xl:text-7xl">
                  {shortName(event.fighterA)}
                </span>
                <span className="my-2 flex items-center gap-4 text-xl text-[#e31b23] sm:text-2xl">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#e31b23]/70" />
                  VS
                  <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#e31b23]/70" />
                </span>
                <span className="block text-5xl text-stroke sm:text-6xl xl:text-7xl">
                  {shortName(event.fighterB)}
                </span>
              </h1>

              <p className="mt-6 hidden max-w-xl text-lg leading-8 text-white/70 sm:block">
                {HERO_BLURBS[event.id]}
              </p>

              {/* Premium fight-night countdown card */}
              <div className="mt-8 max-w-xl overflow-hidden rounded-2xl border border-white/12 bg-[#0d0d0d]/85 backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-5 py-3">
                  <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.26em] text-white/70">
                    <Trophy className="size-4 text-[#e31b23]" /> Fight Night
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-[#e31b23] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                    <span className="size-1.5 animate-pulse rounded-full bg-white" />
                    {event.ticketStatus}
                  </span>
                </div>
                <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <Countdown
                    date={`${event.date}T${hour}:00:00`}
                    timezone={event.timezone}
                  />
                  <div className="shrink-0 border-white/10 sm:border-l sm:pl-5">
                    <p className="font-display text-base font-semibold uppercase tracking-wide text-white">
                      {formatShortDate(event.date)}
                    </p>
                    <p className="mt-0.5 text-xs text-white/50">
                      {event.venue} · {event.time}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href={`/events/${event.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e31b23] px-8 py-4 font-display text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#c3161d]"
                >
                  <Ticket className="size-4" /> Get Tickets
                </Link>
                <Link
                  href="/live"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-black/40 px-8 py-4 font-display text-sm font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md transition hover:border-[#e31b23]/50 hover:bg-white/10"
                >
                  <Play className="size-4 fill-current text-[#e31b23]" /> Watch Live
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ---------- CENTER: the fighters, poster clash ---------- */}
          <div className="relative hidden items-center justify-center lg:flex lg:py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={`posters-${event.id}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={fade}
                className="flex items-end"
              >
                {fighterA && (
                  <Link
                    href={`/fighters/${fighterA.id}`}
                    className="group relative z-10"
                  >
                    <div className="relative w-[200px] overflow-hidden rounded-l-[28px] border-2 border-r-0 border-[#e31b23]/70 sm:w-[230px] lg:w-[260px]">
                      <img
                        src={imageA}
                        alt={fighterA.name}
                        className={`img-zoom h-[300px] w-full object-cover sm:h-[380px] lg:h-[430px] ${
                          overrideA?.position ?? "object-top"
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/15 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                        <p className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                          {shortName(fighterA.name)}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-white/60">
                          <Flag className="size-3.5 text-[#e31b23]" />{" "}
                          {fighterA.country} · {recA?.wins}-{recA?.losses}-{recA?.draws}
                          <span className="text-[#e31b23]">({recA?.kos} KO)</span>
                        </p>
                      </div>
                    </div>
                  </Link>
                )}

                <div className="relative z-20 -mx-5 grid size-14 shrink-0 place-items-center rounded-full border border-white/20 bg-[#e31b23] shadow-lg sm:size-16">
                  <span className="font-display text-base font-black uppercase tracking-wider text-white sm:text-lg">
                    VS
                  </span>
                </div>

                {fighterB && (
                  <Link
                    href={`/fighters/${fighterB.id}`}
                    className="group relative z-10"
                  >
                    <div className="relative w-[200px] overflow-hidden rounded-r-[28px] border-2 border-l-0 border-[#f5c518]/70 sm:w-[230px] lg:w-[260px]">
                      <img
                        src={imageB}
                        alt={fighterB.name}
                        className={`img-zoom h-[300px] w-full object-cover sm:h-[380px] lg:h-[430px] ${
                          overrideB?.position ?? "object-top"
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/15 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4 text-right">
                        <p className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                          {shortName(fighterB.name)}
                        </p>
                        <p className="mt-1 flex items-center justify-end gap-1.5 text-xs text-white/60">
                          <Flag className="size-3.5 text-[#f5c518]" />{" "}
                          {fighterB.country} · {recB?.wins}-{recB?.losses}-{recB?.draws}
                          <span className="text-[#e31b23]">({recB?.kos} KO)</span>
                        </p>
                      </div>
                    </div>
                  </Link>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ---------- FULL FIGHT CARD ---------- */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`card-${event.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={fade}
            className="mt-8 lg:mt-12"
          >
            <FightCard
              card={event.card}
              eventId={event.id}
              eventTitle={event.title}
            />
          </motion.div>
        </AnimatePresence>

        {/* Fight selector */}
        <div className="mt-12 flex items-center justify-center gap-2">
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
        <div className="mt-8 hidden grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid sm:grid-cols-4">
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
  );
}
