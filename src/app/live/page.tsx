import Link from "next/link";
import {
  Clock3,
  Eye,
  Headphones,
  Maximize2,
  Pause,
  Play,
  Radio,
  Signal,
  WifiHigh,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/SectionHeading";
import { EventCard } from "@/components/cards/EventCard";
import { events, liveEvent } from "@/data/events";

export const metadata = {
  title: "Live Fights",
  description:
    "Watch live boxing — the current main event, live scorecards, commentary and the full upcoming broadcast schedule.",
};

const scorecardRounds = [
  { r: 1, a: "10", b: "9" },
  { r: 2, a: "10", b: "9" },
  { r: 3, a: "9", b: "10" },
  { r: 4, a: "10", b: "9" },
  { r: 5, a: "10", b: "9" },
  { r: 6, a: "9", b: "10" },
  { r: 7, a: "10", b: "9" },
  { r: 8, a: "10", b: "9" },
];

const commentary = [
  { time: "R8 · 1:12", text: "Big left hook from the champion catches the challenger clean — crowd is on its feet at the Tokyo Dome." },
  { time: "R8 · 2:05", text: "Body work from Nakatani slowing the pace, but Inoue answers with a sharp 1-2." },
  { time: "R7 · 0:48", text: "Beautiful counter right down the middle. Inoue closing the distance beautifully." },
];

export default function LivePage() {
  const upcoming = events.slice(1, 5);
  const aName = liveEvent.fighterA.split(" ").at(-1) ?? "A";
  const bName = liveEvent.fighterB.split(" ").at(-1) ?? "B";

  return (
    <div className="text-white">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(100%_120%_at_50%_-20%,rgba(227,27,35,0.25),transparent_55%)]" />
        <div className="relative mx-auto flex max-w-[1440px] flex-wrap items-end justify-between gap-6 px-6 py-14 lg:px-8">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
              <Link href="/" className="transition hover:text-white">Home</Link>
              <span className="text-[#e31b23]">/</span>
              <span className="text-white/70">Live</span>
            </div>
            <h1 className="mt-4 font-display text-5xl font-bold uppercase tracking-tight text-white sm:text-6xl">
              Live <span className="text-[#e31b23]">Now</span>
            </h1>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#e31b23] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white">
            <span className="relative flex size-2">
              <span className="live-dot inline-flex size-2 rounded-full bg-white" />
            </span>
            On air · {liveEvent.title}
          </span>
        </div>
      </section>

      {/* Live player + scorecard */}
      <section className="mx-auto max-w-[1440px] px-6 py-14 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          {/* Video player */}
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-black">
            <div className="relative aspect-video">
              <img
                src={liveEvent.posterImage}
                alt={liveEvent.title}
                className="h-full w-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
              <div className="absolute left-4 top-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e31b23] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                  <span className="relative flex size-2">
                    <span className="live-dot inline-flex size-2 rounded-full bg-white" />
                  </span>
                  LIVE
                </span>
                <span className="hidden items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-md sm:inline-flex">
                  <Eye className="size-3.5 text-[#e31b23]" /> 84,200 watching
                </span>
              </div>
              <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-md">
                <Signal className="size-3.5 text-emerald-400" /> 4K HDR · Round 8
              </div>
              <div className="absolute inset-0 grid place-items-center">
                <button className="grid size-20 place-items-center rounded-full bg-[#e31b23] text-white shadow-[0_0_0_10px_rgba(227,27,35,0.25)] transition hover:scale-105">
                  <Pause className="size-8 fill-current" />
                </button>
              </div>
              {/* Player controls */}
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-4 p-4">
                <Button size="sm" className="rounded-full bg-[#e31b23] px-4 hover:bg-[#c3161d]">
                  <Play className="size-3.5 fill-current" /> Replay
                </Button>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full w-2/3 rounded-full bg-[#e31b23]" />
                </div>
                <span className="text-[11px] font-semibold tabular-nums text-white/80">1:04:22</span>
                <Clock3 className="size-4 text-white/70" />
                <Maximize2 className="size-4 text-white/70" />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-[#111111] p-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#e31b23]">
                  {liveEvent.weightClass}
                </p>
                <h2 className="font-display text-2xl font-semibold uppercase tracking-wide text-white">
                  {liveEvent.title}
                </h2>
                <p className="text-xs text-white/45">
                  {liveEvent.venue} · {liveEvent.city}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70">
                  <Headphones className="size-3.5 text-[#e31b23]" /> English commentary
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70">
                  <Radio className="size-3.5 text-[#e31b23]" /> Radio call
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70">
                  <WifiHigh className="size-3.5 text-[#e31b23]" /> 4K
                </span>
              </div>
            </div>
          </div>

          {/* Scorecard */}
          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-white/10 bg-[#111111]">
              <div className="flex items-center justify-between border-b border-white/10 p-5">
                <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-white">
                  Live Scorecard
                </h3>
                <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">
                  Official
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-3">
                <span className="font-display text-sm font-semibold uppercase text-white">{aName}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Round</span>
                <span className="font-display text-sm font-semibold uppercase text-white">{bName}</span>
              </div>
              <div className="max-h-[300px] divide-y divide-white/6 overflow-y-auto">
                {scorecardRounds.map((round) => (
                  <div key={round.r} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-2.5">
                    <span className={`font-display text-base font-bold ${round.a === "10" ? "text-white" : "text-white/40"}`}>
                      {round.a}
                    </span>
                    <span className="grid size-7 place-items-center rounded-md bg-white/5 text-xs font-bold text-white/60">
                      {round.r}
                    </span>
                    <span className={`text-right font-display text-base font-bold ${round.b === "10" ? "text-white" : "text-white/40"}`}>
                      {round.b}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-white/10 bg-gradient-to-r from-[#e31b23]/15 to-transparent px-5 py-4">
                <span className="font-display text-xl font-bold text-white">78</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Totals</span>
                <span className="font-display text-xl font-bold text-white">73</span>
              </div>
            </div>

            {/* Commentary */}
            <div className="flex-1 rounded-3xl border border-white/10 bg-[#111111] p-5">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold uppercase tracking-wide text-white">
                <Headphones className="size-4 text-[#e31b23]" /> Ringside Commentary
              </h3>
              <div className="mt-4 space-y-4">
                {commentary.map((c, i) => (
                  <div key={i} className="border-l-2 border-[#e31b23]/40 pl-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#e31b23]">{c.time}</p>
                    <p className="mt-1 text-sm leading-6 text-white/65">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming broadcasts */}
      <section className="border-t border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-8">
          <SectionHeading
            subtitle="Coming up next"
            title="Broadcast Schedule"
            description="Every live event on the BoxArena platform — mark your calendar."
            actionLabel="All events"
            actionHref="/events"
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
