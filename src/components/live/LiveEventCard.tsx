import { CalendarDays, ExternalLink, MapPin, Radio } from "lucide-react";
import type { LiveEvent } from "@/shared/live";
import { formatEventDate, thumbOrFallback } from "@/lib/live-client";
import { AccessBadge, StatusBadge, TierBadge } from "./badges";

interface LiveEventCardProps {
  event: LiveEvent;
  variant?: "grid" | "compact";
}

function primaryStream(event: LiveEvent) {
  return event.streams.find((stream) => stream.isPrimary) ?? event.streams[0];
}

function WatchButton({ event }: { event: LiveEvent }) {
  const stream = primaryStream(event);
  if (!stream?.url) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
        <Radio className="size-3.5" /> Official broadcast
      </span>
    );
  }
  return (
    <a
      href={stream.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/80 transition hover:border-[#e31b23]/50 hover:text-white"
    >
      <ExternalLink className="size-3.5 text-[#e31b23]" />
      {event.status === "live" ? "Watch live" : "Official source"}
    </a>
  );
}

export function LiveEventCard({ event, variant = "grid" }: LiveEventCardProps) {
  if (variant === "compact") {
    const stream = primaryStream(event);
    return (
      <article className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#111111] p-3.5">
        <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg">
          <img src={thumbOrFallback(event.thumbnail)} alt={event.title} loading="lazy" className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#e31b23]">
            <span>{event.weightClass?.split(" (")[0] ?? "Boxing"}</span>
            <span className="text-white/25">·</span>
            <span className="text-white/50">{formatEventDate(event.eventDate)}</span>
          </div>
          <h3 className="mt-0.5 truncate font-display text-lg font-semibold uppercase tracking-wide text-white">{event.title}</h3>
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-white/45">
            <span className="font-bold uppercase tracking-wide">{event.origin}</span>
            {event.location ? <span>· {event.location.split(",")[0]}</span> : null}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <TierBadge tier={event.verificationTier} />
          {stream?.url ? (
            <a
              href={stream.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/75 transition hover:border-[#e31b23]/50 hover:text-white"
            >
              <ExternalLink className="size-3 text-[#e31b23]" /> Watch
            </a>
          ) : null}
        </div>
      </article>
    );
  }

  const fighterLine = event.fighter1 && event.fighter2 ? `${event.fighter1} vs ${event.fighter2}` : null;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111111] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#e31b23]/45 hover:shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
      <div className="relative h-44 overflow-hidden">
        <img
          src={thumbOrFallback(event.thumbnail)}
          alt={event.title}
          loading="lazy"
          className="img-zoom h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/40 to-transparent" />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <StatusBadge status={event.status} />
        </div>
        <div className="absolute right-3 top-3">
          <AccessBadge access={event.access} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
          <span>{event.weightClass?.split(" (")[0] ?? "Boxing"}</span>
          {event.organization ? (
            <>
              <span className="text-white/25">·</span>
              <span className="text-[#e31b23]">{event.organization}</span>
            </>
          ) : null}
        </div>
        <h3 className="mt-2 font-display text-2xl font-semibold uppercase leading-none tracking-wide text-white">
          {event.title}
        </h3>
        {fighterLine ? (
          <p className="mt-1 truncate text-sm text-white/55">{fighterLine}</p>
        ) : null}
        <div className="mt-4 space-y-2 text-sm text-white/60">
          <p className="flex items-center gap-2">
            <CalendarDays className="size-4 text-[#e31b23]" />
            {formatEventDate(event.eventDate)} {event.startTime ? `· ${event.startTime}` : ""}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="size-4 text-[#e31b23]" />
            {[event.venue, event.location].filter(Boolean).join(", ") || "—"}
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-3.5">
          <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-white">
            <span className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Source: {event.origin}</span>
          </span>
          <WatchButton event={event} />
        </div>
      </div>
    </article>
  );
}
