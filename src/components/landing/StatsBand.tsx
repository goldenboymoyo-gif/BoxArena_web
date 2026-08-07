"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { events } from "@/data/events";
import { divisions } from "@/data/rankings";

interface Stat {
  label: string;
  value: number;
  sub: string;
}

function StatCell({ stat, inView }: { stat: Stat; inView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const duration = 1100;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * stat.value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, stat.value]);

  return (
    <div className="flex flex-col items-center justify-center">
      <span className="font-display text-5xl font-bold leading-none tabular-nums text-white">
        {count}
      </span>
      <span className="mt-2.5 text-[10px] font-bold uppercase tracking-[0.24em] text-[#e31b23]">
        {stat.label}
      </span>
      <span className="mt-1 text-[10px] text-white/35">{stat.sub}</span>
    </div>
  );
}

export function StatsBand() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const stats: Stat[] = useMemo(
    () => [
      { label: "Upcoming Events", value: events.length, sub: "Live schedule" },
      { label: "Divisions Ranked", value: divisions.length, sub: "Full tables" },
      {
        label: "Ranked Fighters",
        value: divisions.reduce((n, d) => n + d.rows.length, 0),
        sub: "World class",
      },
      { label: "World Champions", value: divisions.length, sub: "Across divisions" },
    ],
    []
  );

  return (
    <section className="relative border-b border-white/10 bg-[#0a0a0a]">
      <div
        ref={ref}
        className="mx-auto grid max-w-[1440px] grid-cols-2 gap-4 px-6 py-14 sm:grid-cols-4 lg:px-8"
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0d0d0d] py-8"
          >
            <StatCell stat={s} inView={inView} />
          </div>
        ))}
      </div>
    </section>
  );
}
