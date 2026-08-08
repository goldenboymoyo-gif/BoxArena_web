import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Play,
  Ticket,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Countdown } from "@/components/site/Countdown";
import { EventCard } from "@/components/cards/EventCard";
import { events, heroEvent, completedEvents } from "@/data/events";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export const metadata = {
  title: "Events & Fight Schedule",
  description:
    "Every upcoming and completed Ringcraft boxing event — championship fights, tickets, venues and fight cards.",
};

export default function EventsPage() {
  const upcoming = events;
  const featured = heroEvent;

  return (
    <div className="text-white">
      {/* Page header */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(100%_120%_at_50%_-20%,rgba(227,27,35,0.25),transparent_55%)]" />
        <div className="relative mx-auto max-w-[1440px] px-6 py-10 sm:py-16 lg:px-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
            <Link href="/" className="transition hover:text-white">Home</Link>
            <span className="text-[#e31b23]">/</span>
            <span className="text-white/70">Events</span>
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
            Fight <span className="text-[#e31b23]">Schedule</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
            Every championship night on the Ringcraft platform — upcoming events,
            full fight cards and results from the biggest nights in boxing.
          </p>
        </div>
      </section>

      {/* Featured event */}
      <section className="mx-auto max-w-[1440px] px-6 pt-14 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/10">
          <img
            src={featured.posterImage}
            alt={featured.title}
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]/20" />
          <div className="relative grid gap-8 p-8 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:p-12">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#e31b23] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white">
                  <Trophy className="size-4" /> Main Event
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                  {featured.weightClass}
                </span>
              </div>
              <h2 className="mt-5 font-display text-4xl font-bold uppercase leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
                {featured.title}
              </h2>
              <p className="mt-3 text-base italic text-white/55">{featured.headline}</p>
              <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-white/65">
                <span className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-[#e31b23]" />
                  {formatDate(featured.date)} · {featured.time} {featured.timezone}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="size-4 text-[#e31b23]" />
                  {featured.venue}, {featured.city}
                </span>
              </div>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  href={`/events/${featured.id}`}
                  className="rounded-full bg-[#e31b23] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#c3161d]"
                >
                  View full fight card
                </Link>
                <Link
                  href="/tickets"
                  className="rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md transition hover:border-[#e31b23]/50"
                >
                  <Ticket className="mr-1.5 inline size-4 text-[#e31b23]" />
                  Get tickets
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/50 p-6 backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/50">
                Countdown to {featured.title}
              </p>
              <div className="mt-4">
                <Countdown date={`${featured.date}T20:00:00`} timezone={featured.timezone} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Broadcaster</p>
                  <p className="mt-1 font-semibold text-white">{featured.broadcaster}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Tickets from</p>
                  <p className="mt-1 font-semibold text-white">{featured.priceFrom}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming events grid */}
      <section className="mx-auto max-w-[1440px] px-6 py-16 lg:px-8">
        <SectionHeading
          subtitle="Next up"
          title="Upcoming Events"
          description="Reserve your seat at the next chapter of boxing history."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {upcoming.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* Completed events */}
      <section className="border-t border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-8">
          <SectionHeading
            subtitle="Results"
            title="Recent Results"
            description="Catch up on the fights that already made history this year."
            actionLabel="Watch replays"
            actionHref="/videos"
          />
          <div className="mt-10 space-y-4">
            {completedEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#111111] p-5 transition hover:border-[#e31b23]/40 hover:bg-[#151515] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {event.imageA && (
                      <img src={event.imageA} alt={event.fighterA} className="size-12 rounded-full border-2 border-[#e31b23] object-cover object-top" />
                    )}
                    {event.imageB && (
                      <img src={event.imageB} alt={event.fighterB} className="absolute -right-3 -bottom-1 size-9 rounded-full border-2 border-white/40 object-cover object-top" />
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                      {formatDate(event.date)} · {event.venue}
                    </p>
                    <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-white group-hover:text-[#ff5a5a]">
                      {event.title}
                    </h3>
                    <p className="text-xs text-white/45">{event.weightClass}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:shrink-0">
                  <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                    Completed
                  </span>
                  <Button variant="outline" size="sm" className="rounded-full border-white/15 text-white/80">
                    <Play className="size-3.5 text-[#e31b23]" /> Highlights
                  </Button>
                  <ArrowRight className="size-4 text-white/40 transition group-hover:translate-x-1 group-hover:text-white" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
