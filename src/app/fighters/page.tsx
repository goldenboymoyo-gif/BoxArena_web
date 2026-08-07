import Link from "next/link";
import { ArrowRight, ArrowUpRight, Trophy } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { FighterDirectory } from "@/components/fighters/FighterDirectory";
import { fighters, legends } from "@/data/fighters";
import { flagEmoji } from "@/lib/country";

export const metadata = {
  title: "Fighters",
  description:
    "Browse professional boxers — records, weight divisions, physical stats, titles and fighter profiles.",
};

export default function FightersPage() {
  const champions = fighters.filter((f) => f.status === "Champion");

  return (
    <div className="text-white">
      {/* Page header */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(100%_120%_at_50%_-20%,rgba(227,27,35,0.25),transparent_55%)]" />
        <div className="relative mx-auto max-w-[1440px] px-6 py-16 lg:px-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
            <Link href="/" className="transition hover:text-white">Home</Link>
            <span className="text-[#e31b23]">/</span>
            <span className="text-white/70">Fighters</span>
          </div>
          <h1 className="mt-4 font-display text-5xl font-bold uppercase tracking-tight text-white sm:text-6xl">
            Fighter <span className="text-[#e31b23]">Roster</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
            The world&apos;s finest professional boxers — records, physical stats,
            championship belts and full fighter profiles.
          </p>
        </div>
      </section>

      {/* Champions strip */}
      <section className="border-b border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto max-w-[1440px] px-6 py-10 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#e31b23]/15 text-[#e31b23]">
                <Trophy className="size-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/45">
                  Champions
                </p>
                <p className="font-display text-xl font-semibold uppercase tracking-wide text-white">
                  The Belt Holders
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {champions.map((f) => (
                <Link
                  key={f.id}
                  href={`/fighters/${f.id}`}
                  className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pr-3.5 pl-1.5 transition hover:border-[#e31b23]/50"
                >
                  <img
                    src={f.image}
                    alt={f.name}
                    className="size-7 rounded-full object-cover object-top"
                  />
                  <span className="text-xs font-semibold text-white/75 group-hover:text-white">
                    {f.name.split(" ")[0]}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Directory */}
      <section className="mx-auto max-w-[1440px] px-6 py-16 lg:px-8">
        <SectionHeading
          subtitle="Explore"
          title="All Fighters"
          description="Filter by weight division or search by name, nickname or country."
        />
        <div className="mt-10">
          <FighterDirectory fighters={fighters} />
        </div>
      </section>

      {/* Legends */}
      <section id="legends" className="border-t border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-8">
          <SectionHeading
            subtitle="Hall of Fame"
            title="The Legends"
            description="The immortals of the sweet science — their eras, records and legacies."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {legends.map((legend) => (
              <a
                key={legend.name}
                href={legend.wiki}
                target="_blank"
                rel="noreferrer"
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#111111] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#e31b23]/45"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={legend.image}
                    alt={legend.name}
                    loading="lazy"
                    className="img-zoom h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                  <span className="absolute right-3 top-3 rounded-lg border border-white/15 bg-black/50 px-2 py-1 text-base leading-none backdrop-blur-md">
                    {flagEmoji(legend.country)}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-white">
                    {legend.name}
                  </h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#e31b23]">
                    {legend.era} · {legend.record}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/50">{legend.legacy}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45 transition group-hover:text-[#e31b23]">
                    Read the story
                    <ArrowUpRight className="size-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1440px] px-6 py-16 lg:px-8">
        <div className="flex flex-col items-center gap-5 rounded-3xl border border-white/10 bg-gradient-to-r from-[#e31b23]/20 via-[#111111] to-[#111111] p-10 text-center">
          <h2 className="max-w-2xl font-display text-3xl font-semibold uppercase tracking-wide text-white sm:text-4xl">
            Want to see them fight in person?
          </h2>
          <p className="max-w-xl text-sm leading-7 text-white/55">
            Tickets for all championship nights are on sale now — secure your seat
            ringside for the next era of boxing history.
          </p>
          <Link
            href="/events"
            className="group flex items-center gap-2 rounded-full bg-[#e31b23] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#c3161d]"
          >
            Browse events <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
