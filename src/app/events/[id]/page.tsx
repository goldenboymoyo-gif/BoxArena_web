import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Clock3,
  Gavel,
  MapPin,
  Radio,
  Scale,
  Ticket,
  Trophy,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/site/Countdown";
import { TaleOfTheTape } from "@/components/cards/TaleOfTheTape";
import { EventCard } from "@/components/cards/EventCard";
import { FightCard } from "@/components/cards/FightCard";
import { events, getEvent } from "@/data/events";
import { getFighterByName } from "@/data/fighters";
import { flagEmoji } from "@/lib/country";

export function generateStaticParams() {
  return events.map((e) => ({ id: e.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = getEvent(id);
  if (!event) return {};
  return {
    title: event.title,
    description: `${event.headline} — ${event.venue}, ${event.city}. ${event.titles.join(" · ")} titles at stake.`,
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = getEvent(id);
  if (!event) notFound();

  const fighterA = getFighterByName(event.fighterA);
  const fighterB = getFighterByName(event.fighterB);
  const others = events.filter((e) => e.id !== event.id).slice(0, 3);

  return (
    <div className="text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src={event.posterImage}
          alt={event.title}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(227,27,35,0.22),transparent_55%),linear-gradient(180deg,rgba(8,8,8,0.5),#080808_95%)]" />
        <div className="relative mx-auto max-w-[1440px] px-6 py-10 sm:py-16 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
            <Link href="/" className="transition hover:text-white">Home</Link>
            <span className="text-[#e31b23]">/</span>
            <Link href="/events" className="transition hover:text-white">Events</Link>
            <span className="text-[#e31b23]">/</span>
            <span className="text-white/70">{event.title}</span>
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#e31b23] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white">
                  <Trophy className="size-4" /> {event.status === "Completed" ? "Result" : "Main Event"}
                </span>
                {event.titles.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[#f5c518]/40 bg-[#f5c518]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#f5c518]"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-8">
                {fighterA && (
                  <Link href={`/fighters/${fighterA.id}`} className="group text-center">
                    <img
                      src={fighterA.image}
                      alt={fighterA.name}
                      className="size-20 rounded-2xl border-2 border-[#e31b23] object-cover object-top shadow-xl sm:size-32"
                    />
                    <p className="mt-3 font-display text-base font-semibold uppercase tracking-wide text-white group-hover:text-[#ff5a5a] sm:text-xl">
                      {fighterA.name}
                    </p>
                    <p className="text-xs text-white/50">
                      {flagEmoji(fighterA.country)} {fighterA.record.wins}-{fighterA.record.losses}-{fighterA.record.draws} ({fighterA.record.kos} KO)
                    </p>
                  </Link>
                )}
                <div className="flex flex-col items-center gap-1">
                  <span className="font-display text-4xl font-bold uppercase tracking-widest text-[#e31b23] sm:text-6xl">
                    VS
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
                    {event.weightClass}
                  </span>
                </div>
                {fighterB && (
                  <Link href={`/fighters/${fighterB.id}`} className="group text-center">
                    <img
                      src={fighterB.image}
                      alt={fighterB.name}
                      className="size-20 rounded-2xl border-2 border-white/40 object-cover object-top shadow-xl sm:size-32"
                    />
                    <p className="mt-3 font-display text-base font-semibold uppercase tracking-wide text-white group-hover:text-[#ff5a5a] sm:text-xl">
                      {fighterB.name}
                    </p>
                    <p className="text-xs text-white/50">
                      {flagEmoji(fighterB.country)} {fighterB.record.wins}-{fighterB.record.losses}-{fighterB.record.draws} ({fighterB.record.kos} KO)
                    </p>
                  </Link>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-white/65">
                <span className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-[#e31b23]" />
                  {formatDate(event.date)} · {event.time} {event.timezone}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="size-4 text-[#e31b23]" />
                  {event.venue}, {event.city}
                </span>
                <span className="flex items-center gap-2">
                  <Users className="size-4 text-[#e31b23]" />
                  {event.expectedAttendance}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/50 p-6 backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/50">
                {event.status === "Completed" ? "Fight night has ended" : `Countdown to ${event.title}`}
              </p>
              <div className="mt-4">
                <Countdown date={`${event.date}T20:00:00`} timezone={event.timezone} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Tickets</p>
                  <p className="mt-1 font-semibold text-white">{event.priceFrom}+</p>
                  <p className="text-xs text-white/40">{event.ticketStatus}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Broadcast</p>
                  <p className="mt-1 font-semibold text-white">{event.broadcaster}</p>
                </div>
              </div>
              <Link
                href={`/tickets?event=${event.id}`}
                className="mt-5 flex items-center justify-center gap-2 rounded-full bg-[#e31b23] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#c3161d]"
              >
                <Ticket className="size-4" /> Buy tickets
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tale of the tape + card */}
      <section className="mx-auto max-w-[1440px] px-6 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-6 w-1 rounded-full bg-[#e31b23]" />
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#e31b23]">
                Tale of the Tape
              </p>
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide text-white">
              The Numbers
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/55">
              How the two combatants measure up ahead of {event.title}.
            </p>
            <div className="mt-6">
              {fighterA && fighterB ? (
                <TaleOfTheTape fighterA={fighterA} fighterB={fighterB} />
              ) : (
                <div className="rounded-2xl border border-white/10 bg-[#111111] p-8 text-sm text-white/55">
                  Full fighter profiles available on the fighters page.
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="h-6 w-1 rounded-full bg-[#e31b23]" />
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#e31b23]">
                Fight Card
              </p>
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide text-white">
              Full Undercard
            </h2>
            <FightCard card={event.card} className="mt-6" />
          </div>
        </div>
      </section>

      {/* Event details */}
      <section className="border-y border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="h-6 w-1 rounded-full bg-[#e31b23]" />
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#e31b23]">
              Event Information
            </p>
          </div>
          <h2 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide text-white">
            Fight Night Details
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Building2, label: "Promoter", value: event.promoter },
              { icon: Radio, label: "Broadcaster", value: event.broadcaster },
              { icon: Gavel, label: "Referee", value: event.referee },
              { icon: Scale, label: "Judges", value: event.judges.join(", ") },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-[#111111] p-5">
                <item.icon className="size-5 text-[#e31b23]" />
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.24em] text-white/40">
                  {item.label}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#111111] p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="grid size-12 place-items-center rounded-xl border border-white/15 bg-white/5 text-[#e31b23]">
                <Clock3 className="size-6" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Doors open · {event.time}</p>
                <p className="text-xs text-white/45">
                  {event.venue} · {event.timezone} · {event.ticketStatus}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" size="lg" className="rounded-full border-white/15 text-white/85 hover:border-[#e31b23]/50">
                Add to calendar
              </Button>
              <Link
                href={`/tickets?event=${event.id}`}
                className="rounded-full bg-[#e31b23] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#c3161d]"
              >
                <Ticket className="size-4" /> Get tickets
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* More events */}
      <section className="mx-auto max-w-[1440px] px-6 py-16 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-6 w-1 rounded-full bg-[#e31b23]" />
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#e31b23]">
                Keep watching
              </p>
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide text-white">
              More Upcoming Events
            </h2>
          </div>
          <Link
            href="/events"
            className="group flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white/80 transition hover:border-[#e31b23]/50 hover:text-white"
          >
            All events <ArrowRight className="size-4 text-[#e31b23] transition group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
}
