import Link from "next/link";
import { SectionHeading } from "@/components/site/SectionHeading";
import { DivisionRankings } from "@/components/rankings/DivisionRankings";
import { divisions } from "@/data/rankings";

export const metadata = {
  title: "Rankings & Weight Divisions",
  description:
    "Official Pugnera rankings across all 17 professional weight divisions â€” champions, contenders, points and movement.",
};

export default function RankingsPage() {
  return (
    <div className="text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(100%_120%_at_50%_-20%,rgba(227,27,35,0.25),transparent_55%)]" />
        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 py-10 sm:py-16 lg:px-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
            <Link href="/" className="transition hover:text-white">Home</Link>
            <span className="text-[#e31b23]">/</span>
            <span className="text-white/70">Rankings</span>
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
            Rankings & <span className="text-[#e31b23]">Divisions</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
            All 17 professional weight divisions ranked by our editorial panel â€”
            champions, contenders, points and week-to-week movement.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 py-14 lg:px-8">
        <SectionHeading
          subtitle="Division Rankings"
          title="Weight Class Ladder"
          description="Select a weight class to view the full top-ten table."
        />
        <div className="mt-10">
          <DivisionRankings divisions={divisions} />
        </div>
      </section>

      {/* P4P banner */}
      <section className="border-t border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-16 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/10">
            <div className="absolute inset-0 bg-[radial-gradient(80%_120%_at_50%_0%,rgba(227,27,35,0.25),transparent_60%)]" />
            <div className="relative grid gap-8 p-8 lg:grid-cols-2 lg:p-12">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#e31b23]">
                  Pound-for-Pound
                </p>
                <h2 className="mt-3 font-display text-4xl font-semibold uppercase tracking-wide text-white">
                  The Top 5 Fighters on Earth
                </h2>
                <p className="mt-4 max-w-lg text-sm leading-7 text-white/55">
                  Ranked regardless of weight class. These are the men shaping the
                  sport&apos;s biggest moments in 2026.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Oleksandr Usyk", div: "Heavyweight", record: "25-1 (16 KO)" },
                  { name: "Terence Crawford", div: "Welterweight", record: "41-0 (31 KO)" },
                  { name: "Naoya Inoue", div: "Super Bantamweight", record: "30-0 (26 KO)" },
                  { name: "Canelo Ãlvarez", div: "Super Middleweight", record: "63-3-2 (40 KO)" },
                  { name: "Dmitry Bivol", div: "Light Heavyweight", record: "23-1 (12 KO)" },
                ].map((f, i) => (
                  <div
                    key={f.name}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#e31b23] font-display text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg font-semibold uppercase tracking-wide text-white">
                        {f.name}
                      </p>
                      <p className="text-xs text-white/45">
                        {f.div} Â· {f.record}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
