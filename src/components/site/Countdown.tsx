"use client";

import { Fragment, useEffect, useState } from "react";

interface CountdownProps {
  date: string;
  timezone?: string;
  compact?: boolean;
  pill?: boolean;
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

export function Countdown({ date, timezone, compact, pill }: CountdownProps) {
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

  if (pill) {
    return (
      <div className="grid grid-cols-4 items-center gap-x-2 gap-y-1 sm:flex sm:items-center sm:gap-5">
        {rendered.map((u, i) => (
          <Fragment key={u.label}>
            <span className="flex flex-col items-center sm:flex-row sm:items-baseline sm:gap-2">
              <span className="font-display text-2xl font-bold leading-none tabular-nums text-white sm:text-4xl lg:text-[44px]">
                {String(u.value).padStart(2, "0")}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45 sm:text-[11px]">
                {u.label}
              </span>
            </span>
            {i < rendered.length - 1 && (
              <span className="hidden font-display text-2xl font-bold text-[#e31b23] sm:block sm:text-3xl">
                :
              </span>
            )}
          </Fragment>
        ))}
        {timezone && (
          <span className="hidden text-[11px] font-bold uppercase tracking-[0.2em] text-white/35 md:inline">
            · {timezone}
          </span>
        )}
      </div>
    );
  }

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
    <div className="grid grid-cols-4 gap-2 sm:flex sm:items-center sm:gap-3">
      {rendered.map((u) => (
        <div
          key={u.label}
          className="flex min-w-0 flex-col items-center rounded-xl border border-white/10 bg-white/5 px-1 py-3 backdrop-blur-md sm:min-w-[68px] sm:px-4"
        >
          <span className="font-display text-xl font-bold tabular-nums text-white sm:text-3xl">
            {String(u.value).padStart(2, "0")}
          </span>
          <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/45 sm:text-[10px] sm:tracking-[0.2em]">
            {u.label}
          </span>
        </div>
      ))}
      {timezone && (
        <span className="hidden text-xs uppercase tracking-[0.16em] text-white/35 sm:block">
          {timezone}
        </span>
      )}
    </div>
  );
}
