"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth, initialsOf } from "@/lib/auth";
import { AuthDialog, type AuthMode } from "@/components/site/AuthDialog";
import { events } from "@/data/events";

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

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hydrated, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");

  const signedIn = hydrated && Boolean(user);

  function openAuth(mode: AuthMode) {
    setAuthMode(mode);
    setMenuOpen(false);
    setUserMenuOpen(false);
    setAuthOpen(true);
  }

  function handleBell() {
    if (signedIn) {
      setMenuOpen(false);
      router.push("/dashboard");
    } else {
      openAuth("signin");
    }
  }

  function handleSignOut() {
    signOut();
    setUserMenuOpen(false);
    setMenuOpen(false);
    if (pathname === "/dashboard") router.push("/");
  }

  const navLinks = signedIn
    ? [...nav, { label: "Dashboard", href: "/dashboard" }]
    : nav;

  const tickerItems = useMemo(() => {
    const fights = events
      .filter((e) => e.status !== "Completed")
      .slice(0, 5)
      .map(
        (e) =>
          `${e.fighterA} vs ${e.fighterB} — ${new Date(e.date).toLocaleDateString(
            "en-US",
            { month: "short", day: "numeric" }
          )}`
      );
    return ["Lopez defeated Haney — MSG", ...fights];
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/70 backdrop-blur-xl">
      {/* Live news ticker */}
      <div className="flex items-stretch border-b border-white/5 bg-[#0b0b0b]">
        <div className="relative z-10 flex shrink-0 items-center gap-2 bg-[#e31b23] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-white sm:px-5">
          <span className="live-dot inline-flex size-1.5 rounded-full bg-white" />
          Live
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="animate-ticker flex w-max items-center gap-10 whitespace-nowrap py-2 pl-8">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span
                key={i}
                className="flex items-center gap-10 text-[11px] font-medium uppercase tracking-[0.18em] text-white/60"
              >
                {item}
                <span className="text-[#e31b23]">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-20 max-w-[1440px] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center">
          <img
            src="/logo.png"
            alt="BoxArena — The Home of Boxing"
            className="h-9 w-auto mix-blend-screen sm:h-10"
          />
        </Link>

        <nav className="hidden shrink-0 items-center gap-1 xl:flex">
          {navLinks.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const isDashboard = item.href === "/dashboard";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-4 py-2.5 text-sm font-medium transition",
                  isDashboard
                    ? "flex items-center gap-1.5 rounded-full border border-[#e31b23]/40 bg-[#e31b23]/10 font-semibold text-white hover:bg-[#e31b23]"
                    : cn(
                        "text-white/65 hover:text-white",
                        active && "bg-white/5 text-white"
                      )
                )}
              >
                {isDashboard && <LayoutDashboard className="size-3.5" />}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Centered search */}
        <div className="ml-auto hidden min-w-0 flex-1 justify-center px-4 lg:flex">
          <div className="flex w-full max-w-md items-center rounded-full border border-white/10 bg-white/5 px-4 py-2.5 transition focus-within:border-[#e31b23]/60 focus-within:bg-white/[0.07]">
            <Search className="size-4 shrink-0 text-white/50" />
            <input
              type="search"
              placeholder="Search fights, fighters, events..."
              className="ml-3 w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
            />
            <kbd className="ml-2 hidden shrink-0 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-white/35 md:block">
              /
            </kbd>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">

          <Button
            variant="ghost"
            size="icon"
            className="relative hidden sm:inline-flex"
            onClick={handleBell}
            aria-label="Notifications"
          >
            <Bell className="size-4.5 text-white/80" />
            <span className="absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-[#e31b23] text-[9px] font-bold text-white">
              3
            </span>
          </Button>

          {signedIn && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-3 transition hover:border-white/20 hover:bg-white/10"
              >
                <span className="grid size-8 place-items-center rounded-full bg-[#e31b23] text-xs font-bold text-white">
                  {initialsOf(user.name)}
                </span>
                <span className="hidden max-w-28 truncate text-sm font-medium text-white/85 sm:block">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown
                  className={cn("size-3.5 text-white/50 transition-transform", userMenuOpen && "rotate-180")}
                />
              </button>
              {userMenuOpen && (
                <>
                  <button
                    aria-label="Close menu"
                    className="fixed inset-0 z-10 cursor-default"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-white/10 bg-[#111111] p-2 shadow-2xl">
                    <div className="border-b border-white/10 px-3 pb-2.5 pt-1.5">
                      <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                      <p className="truncate text-xs text-white/45">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-white/75 transition hover:bg-white/5 hover:text-white"
                    >
                      <LayoutDashboard className="size-4 text-[#e31b23]" /> My Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-white/75 transition hover:bg-white/5 hover:text-white"
                    >
                      <LogOut className="size-4 text-white/50" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                className="hidden rounded-full px-4 text-sm font-semibold uppercase tracking-[0.14em] text-white/80 hover:bg-white/10 hover:text-white sm:inline-flex"
                onClick={() => openAuth("signin")}
              >
                Log in
              </Button>
              <Button
                className="hidden rounded-full bg-[#e31b23] px-5 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#c3161d] sm:inline-flex"
                onClick={() => openAuth("signup")}
              >
                Sign up
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
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
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-3 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white",
                  item.href === "/dashboard"
                    ? "flex items-center gap-1.5 border border-[#e31b23]/40 bg-[#e31b23]/10 font-semibold text-white"
                    : cn(
                        "text-white/70 hover:bg-white/5 hover:text-white",
                        (item.href === "/"
                          ? pathname === "/"
                          : pathname.startsWith(item.href)) && "bg-white/5 text-white"
                      )
                )}
              >
                {item.href === "/dashboard" && <LayoutDashboard className="size-3.5 text-[#e31b23]" />}
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4">
            {signedIn && user ? (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e31b23] text-sm font-bold text-white">
                    {initialsOf(user.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                    <p className="truncate text-xs text-white/45">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 rounded-full border-white/15 text-white/80"
                  onClick={handleSignOut}
                >
                  <LogOut className="size-3.5" /> Sign out
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full border-white/15 text-white/85"
                  onClick={() => openAuth("signin")}
                >
                  <UserRound className="size-4" /> Log in
                </Button>
                <Button
                  className="flex-1 rounded-full bg-[#e31b23] hover:bg-[#c3161d]"
                  onClick={() => openAuth("signup")}
                >
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <AuthDialog
        key={authMode}
        open={authOpen}
        onOpenChange={setAuthOpen}
        initialMode={authMode}
      />
    </header>
  );
}
