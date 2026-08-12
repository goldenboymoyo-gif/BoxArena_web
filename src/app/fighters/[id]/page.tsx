import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Dumbbell,
  MapPin,
  Ruler,
  Scale,
  Swords,
  Target,
  Trophy,
  UserRound,
  Weight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FighterCard } from "@/components/cards/FighterCard";
import { fighters, getFighter } from "@/data/fighters";
import { flagEmoji, formatRecord } from "@/lib/country";

export function generateStaticParams() {
  return fighters.map((f) => ({ id: f.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const fighter = getFighter(id);
  if (!fighter) return {};
  return {
    title: `${fighter.name} — Profile`,
    description: `${fighter.name} (${formatRecord(fighter.record)}), ${fighter.division} boxer. ${fighter.shortBio}`,
  };
}

const skillLabels: Record<keyof (typeof fighters)[0]["skills"], string> = {
  power: "Power",
  speed: "Speed",
  defense: "Defense",
  stamina: "Stamina",
  ringIq: "Ring IQ",
  chin: "Chin",
};

export default async function FighterProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fighter = getFighter(id);
  if (!fighter) notFound();

  const rec = fighter.record;
  const sameDivision = fighters
    .filter((f) => f.id !== fighter.id && f.division === fighter.division)
    .slice(0, 3);

  return (
    <div className="text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <img
          src={fighter.image}
          alt={fighter.name}
          className="absolute inset-0 h-full w-full object-cover object-top opacity-25"
        />
        <div className="absolute inset-0 bg-[radial-gradient(100%_120%_at_50%_-20%,rgba(227,27,35,0.2),transparent_55%),linear-gradient(180deg,rgba(8,8,8,0.55),#080808_90%)]" />
        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 py-10 sm:py-16 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
            <Link href="/" className="transition hover:text-white">Home</Link>
            <span className="text-[#e31b23]">/</span>
            <Link href="/fighters" className="transition hover:text-white">Fighters</Link>
            <span className="text-[#e31b23]">/</span>
            <span className="text-white/70">{fighter.name}</span>
          </div>

          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <img
                src={fighter.image}
                alt={fighter.name}
                className="size-36 rounded-3xl border-2 border-[#e31b23] object-cover object-top sm:size-44"
              />
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  {fighter.rank <= 5 && (
                    <span className="grid size-9 place-items-center rounded-xl bg-[#e31b23] font-display text-base font-bold text-white">
                      #{fighter.rank}
                    </span>
                  )}
                  {fighter.status === "Champion" && (
                    <span className="gold-gradient rounded-xl px-3 py-1.5 font-display text-xs font-bold uppercase tracking-[0.14em] text-black">
                      Champion
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70">
                    {flagEmoji(fighter.country)} {fighter.flagLabel}
                  </span>
                </div>
                <h1 className="mt-4 font-display text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {fighter.name}
                </h1>
                <p className="mt-1 text-base italic text-white/55">
                  &ldquo;{fighter.nickname}&rdquo;
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {fighter.titles.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-[#f5c518]/40 bg-[#f5c518]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#f5c518]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button size="lg" className="w-full rounded-full bg-[#e31b23] px-6 text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-[#c3161d] sm:w-auto lg:w-full">
                Follow fighter
              </Button>
              <Button variant="outline" size="lg" className="w-full rounded-full border-white/15 px-6 text-xs font-bold uppercase tracking-[0.16em] text-white/80 sm:w-auto lg:w-full">
                <Swords className="size-4 text-[#e31b23]" /> Bet on next fight
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats + skills */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-6 w-1 rounded-full bg-[#e31b23]" />
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#e31b23]">
                Fighter Stats
              </p>
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide text-white">
              {fighter.name}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">{fighter.shortBio}</p>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                { icon: Scale, label: "Record", value: `${rec.wins}-${rec.losses}-${rec.draws}` },
                { icon: Target, label: "KOs", value: `${rec.kos} (${fighter.koPercent}%)` },
                { icon: Ruler, label: "Height", value: `${fighter.heightFt} / ${fighter.heightCm}cm` },
                { icon: Weight, label: "Reach", value: `${fighter.reachIn} / ${fighter.reachCm}cm` },
                { icon: Dumbbell, label: "Stance", value: fighter.stance },
                { icon: CalendarDays, label: "Age", value: `${fighter.age} · ${fighter.birthDate}` },
                { icon: Trophy, label: "Rounds Boxed", value: `${fighter.roundsBoxed}` },
                { icon: CalendarDays, label: "Debut", value: fighter.debut },
                { icon: Weight, label: "Weight", value: fighter.currentWeightKg ?? `${fighter.weightClassLimit} division` },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-[#111111] p-5">
                  <stat.icon className="size-5 text-[#e31b23]" />
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.24em] text-white/40">
                    {stat.label}
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Skill bars */}
            <div className="mt-10">
              <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-white">
                Skill Assessment
              </h3>
              <div className="mt-5 space-y-4">
                {Object.entries(fighter.skills).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold uppercase tracking-[0.16em] text-white/70">
                        {skillLabels[key as keyof typeof fighter.skills]}
                      </span>
                      <span className="font-display text-sm font-bold text-white">{value}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#e31b23] to-[#ff5a5a]"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team + next/last fight */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
              <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-white">
                Team & Camp
              </h3>
              <div className="mt-5 space-y-4 text-sm">
                {[
                  { icon: MapPin, label: "Birthplace", value: fighter.birthplace },
                  { icon: UserRound, label: "Residence", value: fighter.residence },
                  { icon: Dumbbell, label: "Trainer", value: fighter.trainer },
                  { icon: Building2, label: "Promoter", value: fighter.promoter },
                  { icon: UserRound, label: "Manager", value: fighter.manager },
                  { icon: Building2, label: "Gym", value: fighter.gym },
                ].map((row) => (
                  <div key={row.label} className="flex items-start gap-3">
                    <row.icon className="mt-0.5 size-4 shrink-0 text-[#e31b23]" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                        {row.label}
                      </p>
                      <p className="mt-0.5 font-semibold text-white">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#e31b23]/30 bg-gradient-to-br from-[#e31b23]/10 to-[#111111] p-6">
              <div className="flex items-center gap-2">
                <Swords className="size-5 text-[#e31b23]" />
                <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-white">
                  Next Fight
                </h3>
              </div>
              {fighter.nextFight ? (
                <div className="mt-4">
                  <p className="font-display text-2xl font-semibold uppercase text-white">
                    {fighter.name.split(" ")[0]} vs {fighter.nextFight.opponent}
                  </p>
                  <p className="mt-2 text-sm text-white/60">{fighter.nextFight.titles}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
                    <CalendarDays className="size-3.5 text-[#e31b23]" />
                    {new Date(fighter.nextFight.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                    <span className="text-white/25">·</span>
                    {fighter.nextFight.venue}
                  </div>
                  {fighter.nextFight && (() => {
                    const opponentKey = fighter.nextFight.opponent.toLowerCase();
                    const eventId =
                      opponentKey === "zhilei zhang"
                        ? "usyk-vs-zhang"
                        : opponentKey === "joseph parker"
                          ? "dubois-vs-parker"
                          : opponentKey === "tyson fury"
                            ? "fury-vs-joshua-2"
                            : opponentKey === "junto nakatani"
                              ? "inoue-vs-nakatani"
                              : null;
                    return eventId ? (
                      <Link
                        href={`/events/${eventId}`}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#e31b23] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#c3161d]"
                      >
                        Event details <ArrowRight className="size-3.5" />
                      </Link>
                    ) : null;
                  })()}
                </div>
              ) : (
                <p className="mt-4 text-sm text-white/50">Next fight to be announced.</p>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
              <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-white">
                Last Fight
              </h3>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="text-sm text-white/55">vs {fighter.lastFight.opponent}</p>
                  <p className="mt-1 text-xs text-white/40">{fighter.lastFight.date}</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold text-white">
                  {fighter.lastFight.result}
                </span>
              </div>
              <p className="mt-3 text-xs leading-5 text-white/45">
                {fighter.lastFight.method} · R{fighter.lastFight.round} · {fighter.lastFight.venue}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Same division */}
      {sameDivision.length > 0 && (
        <section className="border-t border-white/10 bg-[#0b0b0b]">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-16 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-6 w-1 rounded-full bg-[#e31b23]" />
                  <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#e31b23]">
                    {fighter.division}
                  </p>
                </div>
                <h2 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide text-white">
                  Rivals in the Division
                </h2>
              </div>
              <Link
                href="/fighters"
                className="group flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white/80 transition hover:border-[#e31b23]/50 hover:text-white"
              >
                All fighters <ArrowRight className="size-4 text-[#e31b23] transition group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sameDivision.map((f) => (
                <FighterCard key={f.id} fighter={f} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
