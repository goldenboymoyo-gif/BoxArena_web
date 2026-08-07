import Link from "next/link";
import { ArrowRight, Crown, Trophy } from "lucide-react";
import type { CardFight } from "@/data/types";
import { cn } from "@/lib/utils";

interface FightCardProps {
  card: CardFight[];
  eventId?: string;
  eventTitle?: string;
  className?: string;
  maxBouts?: number;
}

export function FightCard({
  card,
  eventId,
  eventTitle,
  className,
  maxBouts,
}: FightCardProps) {
  const rows = maxBouts ? card.slice(0, maxBouts) : card;
  const truncated = maxBouts ? card.length > maxBouts : false;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/10 bg-[#111111]",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.04] px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <Trophy className="size-4 text-[#e31b23]" />
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/70">
            {eventTitle ? `Fight Card · ${eventTitle}` : "Fight Card"}
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
          {card.length} bouts
        </span>
      </div>

      <ul className="divide-y divide-white/[0.07]">
        {rows.map((bout, i) => {
          const isMain = bout.status === "Main Event";
          const isCoMain = bout.status === "Co-Main" || bout.status === "Champion";
          return (
            <li
              key={`${bout.fighters}-${i}`}
              className={cn(
                "group relative flex items-start gap-4 transition hover:bg-white/[0.03]",
                isMain
                  ? "bg-gradient-to-r from-[#e31b23]/12 via-[#e31b23]/4 to-transparent px-5 py-6 sm:px-6"
                  : isCoMain
                    ? "px-5 py-5"
                    : "px-5 py-3.5"
              )}
            >
              {isMain && (
                <span className="absolute inset-y-0 left-0 w-1 bg-[#e31b23]" />
              )}

              <span
                className={cn(
                  "shrink-0 text-right font-display font-bold leading-none",
                  isMain
                    ? "mt-1 w-10 text-3xl text-[#e31b23]"
                    : isCoMain
                      ? "mt-1 w-8 text-xl text-[#f5c518]/70"
                      : "mt-0.5 w-7 text-base text-white/20"
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-[0.2em]",
                      isMain ? "text-[#e31b23]" : "text-white/40"
                    )}
                  >
                    {bout.bout}
                  </p>
                  {bout.titles && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#f5c518]/35 bg-[#f5c518]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#f5c518]">
                      <Crown className="size-2.5" /> {bout.titles}
                    </span>
                  )}
                </div>
                <h3
                  className={cn(
                    "mt-1 font-display font-semibold uppercase tracking-wide text-white",
                    isMain
                      ? "text-2xl sm:text-[26px]"
                      : isCoMain
                        ? "text-xl"
                        : "text-base"
                  )}
                >
                  {bout.fighters}
                </h3>
                <p
                  className={cn(
                    "text-xs text-white/45",
                    isMain && "mt-1.5 font-medium text-white/60"
                  )}
                >
                  {bout.division}
                </p>
              </div>

              <span
                className={cn(
                  "shrink-0 self-start rounded-full font-bold uppercase tracking-[0.14em]",
                  isMain
                    ? "px-3.5 py-1.5 text-[10px] bg-[#e31b23] text-white"
                    : isCoMain
                      ? "border border-[#f5c518]/40 bg-[#f5c518]/10 px-2.5 py-1 text-[9px] text-[#f5c518]"
                      : "bg-white/5 px-2.5 py-1 text-[9px] text-white/50"
                )}
              >
                {bout.status ?? "Undercard"}
              </span>
            </li>
          );
        })}
      </ul>

      {(eventId || truncated) && (
        <Link
          href={eventId ? `/events/${eventId}` : "#"}
          className="flex items-center justify-center gap-2 border-t border-white/10 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-white/60 transition hover:bg-white/[0.03] hover:text-white"
        >
          {truncated ? `View all ${card.length} bouts` : "View full card"}
          <ArrowRight className="size-3.5 text-[#e31b23]" />
        </Link>
      )}
    </div>
  );
}
