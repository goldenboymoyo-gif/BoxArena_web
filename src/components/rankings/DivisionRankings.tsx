"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Crown, Minus } from "lucide-react";
import type { DivisionRanking } from "@/data/types";
import { flagEmoji } from "@/lib/country";

interface DivisionRankingsProps {
  divisions: DivisionRanking[];
}

export function DivisionRankings({ divisions }: DivisionRankingsProps) {
  const [active, setActive] = useState(0);
  const division = divisions[active];

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/45">
          Weight Classes
        </p>
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto lg:flex-col">
          {divisions.map((d, i) => (
            <button
              key={d.division}
              onClick={() => setActive(i)}
              className={`flex shrink-0 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition lg:w-full ${
                i === active
                  ? "border-[#e31b23] bg-[#e31b23]/10 text-white"
                  : "border-white/10 bg-white/5 text-white/55 hover:border-[#e31b23]/40 hover:text-white"
              }`}
            >
              <span>
                <span className="block font-display text-sm font-semibold uppercase tracking-wide">
                  {d.division}
                </span>
                <span className="block text-[10px] uppercase tracking-[0.16em] text-white/40">
                  {d.limit}
                </span>
              </span>
              {i === active && <Crown className="size-4 shrink-0 text-[#e31b23]" />}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-gradient-to-r from-[#e31b23]/15 to-transparent p-6">
          <div>
            <h2 className="font-display text-3xl font-semibold uppercase tracking-wide text-white">
              {division.division}
            </h2>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/45">
              {division.limit} limit
            </p>
          </div>
          <div className="rounded-2xl border border-[#f5c518]/40 bg-[#f5c518]/10 px-5 py-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f5c518]">
              Champion
            </p>
            <p className="mt-0.5 font-display text-lg font-semibold uppercase text-white">
              {division.champion}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                <th className="px-5 py-4">Rank</th>
                <th className="px-5 py-4">Fighter</th>
                <th className="px-5 py-4">Record</th>
                <th className="px-5 py-4">KO</th>
                <th className="px-5 py-4">Points</th>
                <th className="px-5 py-4">Mvmt</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Last Fight</th>
                <th className="px-5 py-4">Next Fight</th>
              </tr>
            </thead>
            <tbody>
              {division.rows.map((row, i) => (
                <tr
                  key={row.name}
                  className="border-b border-white/6 text-sm transition last:border-0 hover:bg-white/[0.03]"
                >
                  <td className="px-5 py-4">
                    <span
                      className={`grid size-8 place-items-center rounded-lg font-display text-sm font-bold ${
                        i === 0
                          ? "bg-[#f5c518] text-black"
                          : i === 1
                            ? "bg-white/15 text-white"
                            : i === 2
                              ? "bg-[#e31b23] text-white"
                              : "bg-white/5 text-white/60"
                      }`}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-2 font-semibold text-white">
                      <span>{flagEmoji(row.country)}</span>
                      {row.name}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-medium text-white/70">{row.record}</td>
                  <td className="px-5 py-4 text-white/70">{row.kos}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-[#e31b23]"
                          style={{ width: `${row.points / 10}%` }}
                        />
                      </div>
                      <span className="font-display text-sm font-bold text-white">{row.points}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {row.movement === "up" ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                        <ChevronUp className="size-3.5" /> Up
                      </span>
                    ) : row.movement === "down" ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-400">
                        <ChevronDown className="size-3.5" /> Down
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-white/45">
                        <Minus className="size-3.5" /> Same
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                        row.status === "Champion"
                          ? "gold-gradient text-black"
                          : row.status === "Interim"
                            ? "bg-[#e31b23]/15 text-[#ff6a6a]"
                            : "bg-white/10 text-white/60"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="max-w-[180px] px-5 py-4 text-xs text-white/50">{row.lastFight}</td>
                  <td className="max-w-[180px] px-5 py-4 text-xs text-white/50">{row.nextFight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
