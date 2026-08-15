import { CalendarDays, ExternalLink, MapPin, Radio } from "lucide-react";
import type { LiveEvent } from "@/shared/live";
import { LiveChat } from "./LiveChat";
import { PugneraPlayer } from "@/components/media/PugneraPlayer";
import { formatEventDate, formatEventTime, isEmbeddableUrl, thumbOrFallback, videoIdFromEmbed } from "@/lib/live-client";
import { AccessBadge, StatusBadge, TierBadge } from "./badges";

interface LiveEventHeroProps {
  event: LiveEvent;
}

export function LiveEventHero({ event }: LiveEventHeroProps) {
  const primary = event.streams.find((stream) => stream.isPrimary) ?? event.streams[0];
  // embeddable is only trusted once the URL is on the known-host allowlist
  // (see isEmbeddableUrl) — source config is admin-gated but still untrusted
  // input as far as the browser's iframe is concerned.
  const embeddable = Boolean(primary?.embeddable && primary.embedUrl && isEmbeddableUrl(primary.embedUrl));
  const youTubeId = embeddable && primary?.embedUrl ? videoIdFromEmbed(primary.embedUrl) : null;
  const thumbnail = thumbOrFallback(event.thumbnail);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
      <div className="min-w-0">
        {youTubeId ? (
          <PugneraPlayer
            videoId={youTubeId}
            title={`${event.title} — live stream`}
            live
            autoplay
            label={event.weightClass ?? undefined}
            poster={thumbnail || undefined}
          />
        ) : embeddable ? (
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black sm:rounded-3xl">
            <iframe
              src={primary?.embedUrl ?? undefined}
              title={`${event.title} — official stream`}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              loading="lazy"
              className="h-full w-full"
            />
          </div>
        ) : (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] sm:rounded-3xl">
            {thumbnail ? (
              <img src={thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-black/30" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                <Radio className="size-3.5 text-[#e31b23]" /> Official broadcast
              </span>
              {primary?.url ? (
                <a
                  href={primary.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#e31b23] px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#c3161d]"
                >
                  <ExternalLink className="size-4" /> Watch official stream
                </a>
              ) : null}
            </div>
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-white/10 bg-[#111111] p-4 sm:rounded-3xl sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={event.status} />
            <AccessBadge access={event.access} />
            <TierBadge tier={event.verificationTier} />
            <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">
              Source: {event.origin}
            </span>
          </div>
          <div className="mt-4 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#e31b23]">
              {event.weightClass ?? "Boxing"}
            </p>
            <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-white sm:text-2xl">
              {event.title}
            </h2>
            {event.fighter1 && event.fighter2 ? (
              <p className="mt-1 text-sm font-semibold text-white/70">
                {event.fighter1} <span className="text-[#e31b23]">vs</span> {event.fighter2}
              </p>
            ) : null}
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs leading-5 text-white/45">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5 text-[#e31b23]" />
                {formatEventDate(event.eventDate)} {formatEventTime(event.eventDate) ? `· ${formatEventTime(event.eventDate)}` : ""}
                {event.startTime ? ` (${event.startTime})` : ""}
              </span>
              {event.venue || event.location ? (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-[#e31b23]" />
                  {[event.venue, event.location].filter(Boolean).join(", ")}
                </span>
              ) : null}
            </p>
          </div>

          {event.streams.length > 0 ? (
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Watch</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {event.streams.map((stream) => (
                  <a
                    key={stream.id}
                    href={stream.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white/80 transition hover:border-[#e31b23]/50 hover:text-white"
                  >
                    <ExternalLink className="size-3.5 text-[#e31b23]" />
                    {stream.label}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <LiveChat className="h-[440px] lg:h-full" />
    </div>
  );
}
