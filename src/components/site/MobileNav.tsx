"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, Play, Radio, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Home", href: "/", Icon: Home },
  { label: "Events", href: "/events", Icon: CalendarDays },
  { label: "Videos", href: "/videos", Icon: Play },
  { label: "Tickets", href: "/tickets", Icon: Ticket },
  { label: "Live", href: "/live", Icon: Radio },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0b0b0b]/90 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 backdrop-blur-xl lg:hidden"
    >
      <div className="grid grid-cols-5">
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
                  : "text-white/45 hover:text-white/80"
              )}
            >
              <span
                className={cn(
                  "grid h-7 w-12 place-items-center rounded-full transition",
                  active && "bg-[#e31b23]/15"
                )}
              >
                <Icon
                  className={cn(
                    "size-[22px] transition",
                    active ? "text-[#e31b23]" : "text-white/55"
                  )}
                  fill={active ? "currentColor" : "none"}
                />
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
