"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Fighters", href: "/fighters" },
  { label: "Rankings", href: "/rankings" },
  { label: "News", href: "/news" },
  { label: "Videos", href: "/videos" },
  { label: "Tickets", href: "/tickets" },
  { label: "Live", href: "/live" },
];

const moreLinks = [
  { label: "My Dashboard", href: "/dashboard" },
  { label: "Pound-for-Pound", href: "/rankings" },
  { label: "The Legends", href: "/fighters#legends" },
  { label: "About BoxArena", href: "/news" },
  { label: "Help & Support", href: "/tickets" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080808]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-[#e31b23] font-display text-lg font-bold tracking-[0.12em] text-white shadow-[0_10px_30px_rgba(227,27,35,0.4)]">
            B
          </div>
          <div className="hidden flex-col md:flex">
            <span className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-white">
              BoxArena
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/45">
              The Home of Boxing
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex">
          {nav.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium text-white/65 transition hover:text-white",
                  active && "bg-white/5 text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="relative">
            <button
              onClick={() => setMoreOpen((v) => !v)}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-white/65 transition hover:text-white"
            >
              More
              <ChevronDown
                className={cn("size-3.5 transition-transform", moreOpen && "rotate-180")}
              />
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-[#111111] p-2 shadow-2xl">
                {moreLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMoreOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm text-white/75 transition hover:bg-white/5 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="ml-auto flex flex-1 items-center justify-end gap-2 sm:gap-3">
          <div className="relative hidden items-center rounded-full border border-white/10 bg-white/5 px-3.5 py-2 lg:flex">
            <Search className="size-4 text-white/50" />
            <input
              type="search"
              placeholder="Search fights, fighters, events"
              className="ml-2.5 w-44 bg-transparent text-sm text-white outline-none placeholder:text-white/40 focus:w-56 transition-all"
            />
          </div>
          <Button variant="ghost" size="icon" className="relative hidden sm:inline-flex">
            <Bell className="size-4.5 text-white/80" />
            <span className="absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-[#e31b23] text-[9px] font-bold text-white">
              3
            </span>
          </Button>
          <Button
            variant="ghost"
            className="hidden rounded-full px-4 text-sm font-semibold uppercase tracking-[0.14em] text-white/80 sm:inline-flex"
          >
            Log in
          </Button>
          <Button className="hidden rounded-full bg-[#e31b23] px-5 text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-[0_14px_34px_rgba(227,27,35,0.35)] transition hover:bg-[#c3161d] sm:inline-flex">
            Sign up
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-[#0b0b0b] px-4 pb-6 pt-3 xl:hidden">
          <div className="relative mb-3 flex items-center rounded-full border border-white/10 bg-white/5 px-3.5 py-2 lg:hidden">
            <Search className="size-4 text-white/50" />
            <input
              type="search"
              placeholder="Search fights, fighters, events"
              className="ml-2.5 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
            />
          </div>
          <nav className="grid grid-cols-2 gap-1">
            {[...nav, { label: "More", href: "/#" }].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-3 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white",
                  pathname.startsWith(item.href) && "bg-white/5 text-white"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex gap-3">
            <Button variant="outline" className="flex-1 rounded-full">
              Log in
            </Button>
            <Button className="flex-1 rounded-full bg-[#e31b23]">Sign up</Button>
          </div>
        </div>
      )}
    </header>
  );
}
