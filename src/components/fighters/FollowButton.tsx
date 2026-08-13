"use client";

import { Bell, BellRing } from "lucide-react";
import { useFollowedFighters } from "@/lib/follow";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  fighterId: string;
  className?: string;
}

export function FollowButton({ fighterId, className }: FollowButtonProps) {
  const { hydrated, isFollowed, toggleFollow } = useFollowedFighters();
  const following = hydrated && isFollowed(fighterId);

  return (
    <button
      type="button"
      onClick={() => toggleFollow(fighterId)}
      aria-pressed={following}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] transition active:scale-[0.98]",
        following
          ? "border border-[#e31b23]/60 bg-[#e31b23]/15 text-white hover:bg-[#e31b23]/25"
          : "bg-[#e31b23] text-white hover:bg-[#c3161d]",
        className
      )}
    >
      {following ? <BellRing className="size-4" /> : <Bell className="size-4" />}
      {following ? "Following" : "Follow fighter"}
    </button>
  );
}
