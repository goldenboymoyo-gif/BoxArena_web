import Link from "next/link";
import { Flame, Zap } from "lucide-react";

const tickerItems = [
  "CANELO vs CRAWFORD — SEP 12 · MSG",
  "USYK vs ZHANG — OCT 17 · RIYADH",
  "INOUE vs NAKATANI — TOKYO DOME",
  "DUBOIS vs PARKER — NOV 7 · WEMBLEY",
  "JOSHUA vs FURY II — DEC 5 · TOTTENHAM",
  "SHAKUR vs DAVIS — AUG 7 · PRUDENTIAL",
  "LOPEZ vs HANEY — RESULT: LOPEZ W UD 12",
  "USYK vs DUBOIS II — RESULT: DUBOIS W TKO 9",
  "BIVOL vs BETERBIEV II — RESULT: BIVOL W MD 12",
  "FURY vs JOSHUA I — RESULT: JOSHUA W TKO 5",
];

export function LiveTicker() {
  const doubled = [...tickerItems, ...tickerItems];
  return (
    <div className="relative z-40 border-b border-white/10 bg-[#0d0d0d]">
      <div className="flex items-stretch">
        <Link
          href="/live"
          className="relative z-10 flex shrink-0 items-center gap-2 bg-[#e31b23] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white"
        >
          <span className="relative flex size-2">
            <span className="live-dot inline-flex size-2 rounded-full bg-white" />
          </span>
          Live
        </Link>
        <div className="relative flex flex-1 items-center overflow-hidden">
          <div className="animate-ticker flex w-max items-center gap-10 py-2 pl-6 whitespace-nowrap">
            {doubled.map((item, i) => (
              <span key={i} className="flex items-center gap-10 text-xs font-medium tracking-[0.14em] text-white/60">
                {item}
                <Zap className="size-3 text-[#e31b23]/70" />
              </span>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0d0d0d] to-transparent" />
        </div>
        <Link
          href="/events"
          className="hidden shrink-0 items-center gap-1.5 border-l border-white/10 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/70 transition hover:text-white lg:flex"
        >
          <Flame className="size-3.5 text-[#e31b23]" />
          Schedule
        </Link>
      </div>
    </div>
  );
}
