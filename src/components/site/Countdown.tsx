"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  date: string;
  timezone?: string;
  compact?: boolean;
}

function getRemaining(target: string) {
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

export function Countdown({ date, timezone, compact }: CountdownProps) {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(() => getRemaining(date));

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) {
        setMounted(true);
        setTime(getRemaining(date));
      }
    }, 0);
    const id = setInterval(() => setTime(getRemaining(date)), 1000);
    return () => {
      active = false;
      clearTimeout(timer);
      clearInterval(id);
    };
  }, [date]);

  const units = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Mins", value: time.minutes },
    { label: "Secs", value: time.seconds },
  ];

  const rendered = mounted
    ? units
    : [
        { label: "Days", value: "--" },
        { label: "Hours", value: "--" },
        { label: "Mins", value: "--" },
        { label: "Secs", value: "--" },
      ];

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {rendered.slice(0, 3).map((u, i) => (
          <span key={u.label} className="flex items-center gap-2 text-sm font-semibold tabular-nums text-white">
            <span className="text-white">
              {String(u.value).padStart(2, "0")}
              <span className="ml-1 text-[10px] font-medium uppercase text-white/40">
                {u.label}
              </span>
            </span>
            {i < 2 && <span className="text-[#e31b23]">:</span>}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {rendered.map((u) => (
        <div
          key={u.label}
          className="flex min-w-[68px] flex-col items-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md"
        >
          <span className="font-display text-3xl font-bold tabular-nums text-white">
            {String(u.value).padStart(2, "0")}
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
            {u.label}
          </span>
        </div>
      ))}
      {timezone && (
        <span className="ml-2 hidden text-xs uppercase tracking-[0.16em] text-white/35 sm:block">
          {timezone}
        </span>
      )}
    </div>
  );
}
