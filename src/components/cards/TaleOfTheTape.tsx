import type { Fighter } from "@/data/types";
import { flagEmoji } from "@/lib/country";

interface TaleOfTheTapeProps {
  fighterA: Fighter;
  fighterB: Fighter;
}

function Row({ label, a, b }: { label: string; a: string; b: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-white/8 py-3 sm:gap-3">
      <span className="min-w-0 truncate text-right font-semibold text-white">{a}</span>
      <span className="w-14 shrink-0 text-center text-[9px] font-bold uppercase tracking-[0.14em] text-white/40 sm:w-24 sm:text-[10px] sm:tracking-[0.22em]">
        {label}
      </span>
      <span className="min-w-0 truncate font-semibold text-white">{b}</span>
    </div>
  );
}

export function TaleOfTheTape({ fighterA, fighterB }: TaleOfTheTapeProps) {
  const ra = fighterA.record;
  const rb = fighterB.record;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111]">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-white/10 p-4 sm:gap-3 sm:p-5">
        <div className="flex min-w-0 flex-col items-start gap-1">
          <img src={fighterA.image} alt={fighterA.name} className="h-12 w-12 shrink-0 rounded-full border-2 border-[#e31b23] object-cover object-top sm:h-16 sm:w-16" />
          <p className="mt-1 w-full truncate text-sm font-semibold text-white sm:text-base">{fighterA.name}</p>
          <p className="w-full truncate text-xs text-white/45">{flagEmoji(fighterA.country)} {fighterA.nickname}</p>
        </div>
        <span className="shrink-0 font-display text-lg font-bold uppercase tracking-widest text-[#e31b23] sm:text-2xl">VS</span>
        <div className="flex min-w-0 flex-col items-end gap-1">
          <img src={fighterB.image} alt={fighterB.name} className="h-12 w-12 shrink-0 rounded-full border-2 border-white/40 object-cover object-top sm:h-16 sm:w-16" />
          <p className="mt-1 w-full truncate text-right text-sm font-semibold text-white sm:text-base">{fighterB.name}</p>
          <p className="w-full truncate text-right text-xs text-white/45">{flagEmoji(fighterB.country)} {fighterB.nickname}</p>
        </div>
      </div>
      <div className="px-5 pb-2">
        <Row label="Record" a={`${ra.wins}-${ra.losses}-${ra.draws}`} b={`${rb.wins}-${rb.losses}-${rb.draws}`} />
        <Row label="KOs" a={`${ra.kos}`} b={`${rb.kos}`} />
        <Row label="Height" a={fighterA.heightFt} b={fighterB.heightFt} />
        <Row label="Reach" a={fighterA.reachIn} b={fighterB.reachIn} />
        <Row label="Stance" a={fighterA.stance} b={fighterB.stance} />
        <Row label="Age" a={`${fighterA.age}`} b={`${fighterB.age}`} />
        <Row label="Debut" a={fighterA.debut.split(",")[0]} b={fighterB.debut.split(",")[0]} />
      </div>
    </div>
  );
}
