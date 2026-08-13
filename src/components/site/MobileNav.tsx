"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, Menu, Play, Radio, Ticket, Trophy, Users, Newspaper, LayoutDashboard, X } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Home", href: "/", Icon: Home },
  { label: "Events", href: "/events", Icon: CalendarDays },
  { label: "Videos", href: "/videos", Icon: Play },
  { label: "Tickets", href: "/tickets", Icon: Ticket },
  { label: "Live", href: "/live", Icon: Radio },
];

const moreTabs = [
  { label: "Fighters", href: "/fighters", Icon: Users },
  { label: "Rankings", href: "/rankings", Icon: Trophy },
  { label: "News", href: "/news", Icon: Newspaper },
  { label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
];

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-50 lg:hidden">
      {moreOpen && (
        <div className="absolute inset-x-3 bottom-[calc(100%+0.75rem)] rounded-2xl border border-white/10 bg-[#111111]/95 p-3 shadow-2xl backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between px-2 pt-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Explore Pugnera</p>
            <button type="button" aria-label="Close more navigation" onClick={() => setMoreOpen(false)} className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white">
              <X className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {moreTabs.map(({ label, href, Icon }) => {
              const active = pathname.startsWith(href);
              return <Link key={href} href={href} onClick={() => setMoreOpen(false)} className={cn("flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition", active ? "bg-[#e31b23]/15 text-white" : "bg-white/5 text-white/65 hover:bg-white/10 hover:text-white")}>
                <Icon className={cn("size-4", active ? "text-[#e31b23]" : "text-white/50")} />{label}
              </Link>;
            })}
          </div>
        </div>
      )}
      <div className="border-t border-white/10 bg-[#0b0b0b]/90 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 backdrop-blur-xl">
      <div className="grid grid-cols-6">
        {tabs.map(({ label, href, Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex flex-col items-center gap-1 py-1 text-[10px] font-bold uppercase tracking-wide transition",
                active
                  ? "text-[#ff5a5a]"
                  : "text-white/45 hover:text-white"
              )}
            >
              <span
                className={cn(
                  "grid h-7 w-12 place-items-center rounded-full transition",
                  active ? "bg-[#e31b23]/15" : "group-hover:bg-white/5"
                )}
              >
                <Icon
                  className={cn(
                    "size-[22px] transition group-hover:scale-110",
                    active
                      ? "text-[#e31b23]"
                      : "text-white/55 group-hover:text-white"
                  )}
                  fill={active ? "currentColor" : "none"}
                />
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
        <button type="button" onClick={() => setMoreOpen((open) => !open)} aria-expanded={moreOpen} className={cn("group flex flex-col items-center gap-1 py-1 text-[10px] font-bold uppercase tracking-wide transition", moreOpen ? "text-[#ff5a5a]" : "text-white/45 hover:text-white")}>
          <span className={cn("grid h-7 w-10 place-items-center rounded-full transition", moreOpen ? "bg-[#e31b23]/15" : "group-hover:bg-white/5")}>
            <Menu className={cn("size-[21px]", moreOpen ? "text-[#e31b23]" : "text-white/55 group-hover:text-white")} />
          </span>
          <span>More</span>
        </button>
      </div>
      </div>
    </nav>
  );
}
