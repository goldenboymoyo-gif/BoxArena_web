import Link from "next/link";
import { CalendarDays, Clock3, MapPin, Ticket } from "lucide-react";
import type { BoxingEvent } from "@/data/types";

interface EventCardProps {
  event: BoxingEvent;
  variant?: "grid" | "compact";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function EventCard({ event, variant = "grid" }: EventCardProps) {
  const statusColor =
    event.status === "Live"
      ? "bg-[#e31b23] text-white"
      : event.status === "Sellout"
        ? "bg-white/10 text-white/80"
        : "bg-white/5 text-white/70";

  if (variant === "compact") {
    return (
      <Link
        href={`/events/${event.id}`}
        className="group flex items-center gap-4 rounded-xl border border-white/10 bg-[#111111] p-3.5 transition hover:border-[#e31b23]/40 hover:bg-[#151515]"
      >
        <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg">
          <img src={event.posterImage} alt={event.title} loading="lazy" className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#e31b23]">
            <span>{event.weightClass.split(" (")[0]}</span>
            <span className="text-white/25">·</span>
            <span className="text-white/50">{formatDate(event.date)}</span>
          </div>
          <h3 className="mt-0.5 truncate font-display text-lg font-semibold uppercase tracking-wide text-white group-hover:text-white">
            {event.title}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-white/45">
            <MapPin className="size-3 shrink-0" /> {event.venue}, {event.city.split(",")[0]}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${statusColor}`}>
          {event.status}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={`/events/${event.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111111] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#e31b23]/45 hover:shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={event.venueImage}
          alt={event.venue}
          loading="lazy"
          className="img-zoom h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/40 to-transparent" />
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${statusColor}`}>
          {event.status === "Live" ? "● Live" : event.status}
        </span>
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-3">
          <div className="relative">
            {event.imageA && (
              <img src={event.imageA} alt={event.fighterA} className="size-14 rounded-full border-2 border-[#e31b23] object-cover object-top shadow-lg" />
            )}
          </div>
          <span className="font-display text-sm font-bold uppercase tracking-widest text-[#e31b23]">VS</span>
          <div className="relative">
            {event.imageB && (
              <img src={event.imageB} alt={event.fighterB} className="size-14 rounded-full border-2 border-white/40 object-cover object-top shadow-lg" />
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
          <span>{event.weightClass.split(" (")[0]}</span>
          {event.titles.length > 0 && (
            <>
              <span className="text-white/25">·</span>
              <span className="text-[#e31b23]">{event.titles.slice(0, 3).join(" · ")}</span>
            </>
          )}
        </div>
        <h3 className="mt-2 font-display text-2xl font-semibold uppercase leading-none tracking-wide text-white">
          {event.title}
        </h3>
        <p className="mt-1 text-xs italic text-white/45">{event.headline}</p>
        <div className="mt-4 space-y-2 text-sm text-white/60">
          <p className="flex items-center gap-2">
            <CalendarDays className="size-4 text-[#e31b23]" />
            {formatDate(event.date)} · {event.time}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="size-4 text-[#e31b23]" />
            {event.venue}, {event.city}
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
            <Ticket className="size-4 text-[#e31b23]" />
            From {event.priceFrom}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/55 transition group-hover:text-white">
            <Clock3 className="size-3.5" /> Get tickets
          </span>
        </div>
      </div>
    </Link>
  );
}
