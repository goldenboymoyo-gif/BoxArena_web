"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, CalendarPlus, Download, MapPin, Trash2 } from "lucide-react";
import type { BoxingEvent } from "@/data/types";
import { downloadIcs } from "@/lib/calendar";

const STORAGE_KEY = "pugnera_calendar";

interface FightCalendarProps {
  events: BoxingEvent[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function FightCalendar({ events }: FightCalendarProps) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        setSavedIds(raw ? (JSON.parse(raw) as string[]) : []);
      } catch {
        // ignore corrupted storage
      }
      setHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const savedEvents = events.filter((e) => savedIds.includes(e.id));

  function remove(id: string) {
    const next = savedIds.filter((x) => x !== id);
    setSavedIds(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  }

  if (hydrated && savedEvents.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#111111] p-10 text-center">
        <CalendarClock className="mx-auto size-8 text-white/25" />
        <p className="mt-4 font-display text-lg font-semibold uppercase tracking-wide text-white">
          No fights on your calendar yet
        </p>
        <p className="mt-2 text-sm text-white/45">
          Open any event page and tap “Add to calendar” to keep fight night at
          your fingertips.
        </p>
        <Link
          href="/events"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#e31b23] px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#c3161d]"
        >
          <CalendarPlus className="size-4" /> Browse events
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {savedEvents.map((event) => (
        <div
          key={event.id}
          className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-[#111111] p-4 transition hover:border-[#e31b23]/40"
        >
          <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-[#e31b23]/15 text-center">
            <div>
              <p className="font-display text-lg font-bold leading-none text-white">
                {formatDate(event.date).split(",")[1]}
              </p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#e31b23]">
                {formatDate(event.date).split(",")[0]}
              </p>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <Link
              href={`/events/${event.id}`}
              className="font-display text-base font-semibold uppercase tracking-wide text-white transition hover:text-[#ff5a5a]"
            >
              {event.title}
            </Link>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/50">
              <span className="flex items-center gap-1">
                <CalendarClock className="size-3 text-[#e31b23]" /> {formatDate(event.date)} · {event.time} {event.timezone}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3 text-[#e31b23]" /> {event.venue}, {event.city.split(",")[0]}
              </span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => downloadIcs(event)}
              aria-label={`Download ${event.title} calendar file`}
              className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white/70 transition hover:border-[#e31b23]/50 hover:text-white"
            >
              <Download className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => remove(event.id)}
              aria-label={`Remove ${event.title} from calendar`}
              className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white/70 transition hover:border-red-500/50 hover:text-red-400"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
