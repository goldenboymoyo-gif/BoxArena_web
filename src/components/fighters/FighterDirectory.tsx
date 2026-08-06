"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Fighter } from "@/data/types";
import { FighterCard } from "@/components/cards/FighterCard";

interface FighterDirectoryProps {
  fighters: Fighter[];
}

export function FighterDirectory({ fighters }: FighterDirectoryProps) {
  const divisions = useMemo(
    () => Array.from(new Set(fighters.map((f) => f.division))),
    [fighters]
  );
  const [division, setDivision] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = fighters.filter((f) => {
    const matchesDivision = division === "All" || f.division === division;
    const matchesQuery =
      query.trim() === "" ||
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.nickname.toLowerCase().includes(query.toLowerCase()) ||
      f.country.toLowerCase().includes(query.toLowerCase());
    return matchesDivision && matchesQuery;
  });

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {["All", ...divisions].map((d) => (
            <button
              key={d}
              onClick={() => setDivision(d)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition ${
                division === d
                  ? "border-[#e31b23] bg-[#e31b23] text-white"
                  : "border-white/15 bg-white/5 text-white/60 hover:border-[#e31b23]/50 hover:text-white"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fighters..."
            className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-[#e31b23]/60"
          />
        </div>
      </div>
      <p className="mt-6 text-sm text-white/45">
        {filtered.length} fighter{filtered.length === 1 ? "" : "s"}
        {division !== "All" ? ` in ${division}` : ""}
      </p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((fighter) => (
          <FighterCard key={fighter.id} fighter={fighter} />
        ))}
      </div>
    </div>
  );
}
