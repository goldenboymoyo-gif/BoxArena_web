import Link from "next/link";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import type { Fighter } from "@/data/types";
import { flagEmoji } from "@/lib/country";

interface FighterCardProps {
  fighter: Fighter;
}

export function FighterCard({ fighter }: FighterCardProps) {
  const rec = fighter.record;
  return (
    <Link
      href={`/fighters/${fighter.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-[#111111] transition-all duration-300 hover:border-[#e31b23]/45 hover:shadow-[0_24px_60px_rgba(0,0,0,0.55)] hover:-translate-y-1.5"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={fighter.image}
          alt={fighter.name}
          loading="lazy"
          className="img-zoom h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent" />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          {fighter.rank <= 5 && (
            <span className="grid size-8 place-items-center rounded-lg bg-[#e31b23] font-display text-sm font-bold text-white shadow-lg">
              #{fighter.rank}
            </span>
          )}
          {fighter.status === "Champion" && (
            <span className="gold-gradient grid h-8 items-center rounded-lg px-2 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-black">
              Champion
            </span>
          )}
        </div>
        <span className="absolute right-3 top-3 rounded-lg border border-white/15 bg-black/50 px-2 py-1 text-base leading-none backdrop-blur-md">
          {flagEmoji(fighter.country)}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
            {fighter.division}
          </p>
          <h3 className="mt-1 font-display text-2xl font-semibold uppercase leading-none tracking-wide text-white">
            {fighter.name}
          </h3>
          {fighter.nickname && (
            <p className="mt-1 text-xs italic text-white/50">&ldquo;{fighter.nickname}&rdquo;</p>
          )}
        </div>
      </div>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-lg font-semibold text-white">
              {rec.wins}-{rec.losses}-{rec.draws}
            </p>
            <p className="text-xs text-white/45">{rec.kos} KO · {fighter.koPercent}% KO rate</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70">
              <BadgeCheck className="size-3.5 text-[#e31b23]" />
              {fighter.status === "Champion" ? "Undisputed" : "Verified"}
            </span>
            <span className="grid size-8 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 transition group-hover:border-[#e31b23]/50 group-hover:text-white">
              <ArrowUpRight className="size-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
