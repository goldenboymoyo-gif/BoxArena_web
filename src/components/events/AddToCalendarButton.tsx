"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, CalendarPlus } from "lucide-react";
import type { BoxingEvent } from "@/data/types";
import { downloadIcs } from "@/lib/calendar";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "pugnera_calendar";

interface AddToCalendarButtonProps {
  event: BoxingEvent;
  className?: string;
}

export function AddToCalendarButton({
  event,
  className,
}: AddToCalendarButtonProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const ids = raw ? (JSON.parse(raw) as string[]) : [];
        setSaved(ids.includes(event.id));
      } catch {
        // ignore corrupted storage
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [event.id]);

  function handleClick() {
    downloadIcs(event);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const ids = raw ? (JSON.parse(raw) as string[]) : [];
      const next = ids.includes(event.id)
        ? ids
        : [...ids, event.id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaved(true);
    } catch {
      // ignore storage errors
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex items-center justify-center gap-2 rounded-full border px-6 py-3.5 text-xs font-bold uppercase tracking-[0.18em] transition hover:border-[#e31b23]/60 active:scale-[0.98]",
        saved
          ? "border-[#e31b23]/60 bg-[#e31b23]/15 text-white"
          : "border-white/25 bg-white/5 text-white hover:bg-white/10",
        className
      )}
    >
      {saved ? (
        <CalendarCheck className="size-4 text-[#e31b23]" />
      ) : (
        <CalendarPlus className="size-4 text-[#e31b23]" />
      )}
      {saved ? "Added to calendar" : "Add to calendar"}
    </button>
  );
}
