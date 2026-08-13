"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth, initialsOf, type AuthUser } from "@/lib/auth";
import { AuthDialog, type AuthMode } from "@/components/site/AuthDialog";
import { SearchForm } from "@/components/site/SearchForm";

function UserMenuDropdown({
  user,
  open,
  onClose,
  onSignOut,
}: {
  user: AuthUser;
  open: boolean;
  onClose: () => void;
  onSignOut: () => void;
}) {
  if (!open) return null;
  return (
    <>
      <button
        aria-label="Close menu"
        className="fixed inset-0 z-10 cursor-default"
        onClick={onClose}
      />
      <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-white/10 bg-[#111111] p-2 shadow-2xl">
        <div className="border-b border-white/10 px-3 pb-2.5 pt-1.5">
          <p className="truncate text-sm font-semibold text-white">{user.name}</p>
          <p className="truncate text-xs text-white/45">{user.email}</p>
        </div>
        <Link
          href="/dashboard"
          onClick={onClose}
          className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-white/75 transition hover:bg-white/5 hover:text-white"
        >
          <LayoutDashboard className="size-4 text-[#e31b23]" /> My Dashboard
        </Link>
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-white/75 transition hover:bg-white/5 hover:text-white"
        >
          <LogOut className="size-4 text-white/50" /> Sign out
        </button>
      </div>
    </>
  );
}

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

  function handleProfileTap() {
    if (signedIn) {
      setMenuOpen(false);
      setUserMenuOpen((v) => !v);
    } else {
      openAuth("signin");
    }
  }

  function handleSettings() {
    setMenuOpen(false);
    router.push("/dashboard");
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

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center gap-3 px-4 sm:gap-6 sm:px-6 lg:px-8">
        {/* Desktop logo */}
        <Link href="/" className="hidden shrink-0 items-center lg:flex">
          <img
            src="/pugnera-logo.png"
            alt="Pugnera — The Home of Boxing"
            className="h-11 w-auto sm:h-12"
          />
        </Link>

        {/* Mobile profile avatar */}
        <div className="relative shrink-0 lg:hidden">
          <button
            type="button"
            onClick={handleProfileTap}
            aria-label="Open profile"
            className="flex items-center"
          >
            {signedIn && user ? (
              <span className="grid size-9 place-items-center rounded-full bg-[#e31b23] text-xs font-bold text-white ring-2 ring-white/15">
                {initialsOf(user.name)}
              </span>
            ) : (
              <span className="grid size-9 place-items-center rounded-full border border-white/15 bg-white/5 text-white/80">
                <UserRound className="size-5" />
              </span>
            )}
          </button>
          {signedIn && user && (
            <UserMenuDropdown
              user={user}
              open={userMenuOpen}
              onClose={() => setUserMenuOpen(false)}
              onSignOut={handleSignOut}
            />
          )}
        </div>

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

        {/* Centered search (desktop) */}
        <div className="ml-auto hidden min-w-0 flex-1 justify-center px-4 lg:flex">
          <SearchForm className="flex w-full max-w-md items-center rounded-full border border-white/10 bg-white/5 px-4 py-2.5 transition focus-within:border-[#e31b23]/60 focus-within:bg-white/[0.07]" />
        </div>

        {/* Search (mobile / tablet) */}
        <div className="min-w-0 flex-1 lg:hidden">
          <SearchForm
            placeholder="Search Pugnera"
            onSubmitted={() => setMenuOpen(false)}
            className="h-10 items-center rounded-full border border-white/10 bg-white/5 px-3.5 transition focus-within:border-[#e31b23]/60 focus-within:bg-white/[0.07]"
          />
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={handleBell}
            aria-label="Notifications"
          >
            <Bell className="size-4.5 text-white/80" />
            <span className="absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-[#e31b23] text-[9px] font-bold text-white">
              3
            </span>
          </Button>

          {signedIn && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSettings}
              aria-label="Settings"
            >
              <Settings className="size-4.5 text-white/80" />
            </Button>
          )}

          {signedIn && user ? (
            <div className="relative hidden lg:block">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-1.5 transition hover:border-white/20 hover:bg-white/10 sm:pr-3"
              >
                <span className="grid size-8 place-items-center rounded-full bg-[#e31b23] text-xs font-bold text-white">
                  {initialsOf(user.name)}
                </span>
                <span className="hidden max-w-28 truncate text-sm font-medium text-white/85 sm:block">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown
                  className={cn("hidden size-3.5 text-white/50 transition-transform sm:block", userMenuOpen && "rotate-180")}
                />
              </button>
              <UserMenuDropdown
                user={user}
                open={userMenuOpen}
                onClose={() => setUserMenuOpen(false)}
                onSignOut={handleSignOut}
              />
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                className="hidden rounded-full px-4 text-sm font-semibold uppercase tracking-[0.14em] text-white/80 hover:bg-white/10 hover:text-white lg:inline-flex"
                onClick={() => openAuth("signin")}
              >
                Log in
              </Button>
              <Button
                className="hidden rounded-full bg-[#e31b23] px-5 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#c3161d] lg:inline-flex"
                onClick={() => openAuth("signup")}
              >
                Sign up
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:inline-flex xl:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-[#0b0b0b] px-4 pb-6 pt-3 xl:hidden">
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
