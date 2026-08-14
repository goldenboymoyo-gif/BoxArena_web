"use client";

import Link from "next/link";
import { Heart, HeartOff } from "lucide-react";
import type { Fighter } from "@/data/types";
import { useFollowedFighters } from "@/lib/follow";
import { FighterCard } from "@/components/cards/FighterCard";

interface FollowedFightersProps {
  fighters: Fighter[];
}

export function FollowedFighters({ fighters }: FollowedFightersProps) {
  const { hydrated, followedIds } = useFollowedFighters();
  const followed = fighters.filter((f) => followedIds.includes(f.id));

  if (hydrated && followed.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#111111] p-10 text-center">
        <HeartOff className="mx-auto size-8 text-white/25" />
        <p className="mt-4 font-display text-lg font-semibold uppercase tracking-wide text-white">
          No fighters followed yet
        </p>
        <p className="mt-2 text-sm text-white/45">
          Head to any fighter profile and tap “Follow fighter” to build your
          watchlist.
        </p>
        <Link
          href="/fighters"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#e31b23] px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#c3161d]"
        >
          <Heart className="size-4" /> Browse fighters
        </Link>
      </div>
    );
  }

  return (
    <div>
      {!hydrated ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {fighters.slice(0, 5).map((fighter) => (
            <FighterCard key={fighter.id} fighter={fighter} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {followed.map((fighter) => (
            <FighterCard key={fighter.id} fighter={fighter} />
          ))}
        </div>
      )}
    </div>
  );
}
