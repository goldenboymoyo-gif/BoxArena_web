import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Bookmark,
  CalendarDays,
  Heart,
  Settings,
  Ticket,
  Trophy,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FighterCard } from "@/components/cards/FighterCard";
import { EventCard } from "@/components/cards/EventCard";
import { TicketList } from "@/components/dashboard/TicketList";
import { myTickets } from "@/data/tickets";
import { events } from "@/data/events";
import { fighters } from "@/data/fighters";

export const metadata = {
  title: "My Dashboard",
  description:
    "Your Ringcraft dashboard — tickets, favorite fighters, watchlist and account.",
};

const sidebarNav = [
  { label: "Overview", icon: UserRound, active: true },
  { label: "My Tickets", icon: Ticket },
  { label: "Watchlist", icon: Bookmark },
  { label: "Favorite Fighters", icon: Heart },
  { label: "Notifications", icon: Bell },
  { label: "Settings", icon: Settings },
];

export default function DashboardPage() {
  const activeTickets = myTickets.filter((t) => t.status === "active");
  const favorites = fighters.filter((f) => f.rank <= 5);
  const nextEvents = events.slice(0, 2);

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* Left sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-white/10 bg-[#111111] p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-[#e31b23] to-[#7a0e12] font-display text-2xl font-bold text-white">
                  JD
                </div>
                <span className="absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full bg-emerald-500 text-[10px] text-black">
                  ✓
                </span>
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-white">
                  Jordan Diaz
                </h2>
                <p className="text-xs text-white/45">Member since 2024</p>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#f5c518]">
                  <BadgeCheck className="size-3" /> Gold Member
                </span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-5 text-center">
              <div>
                <p className="font-display text-xl font-bold text-white">{activeTickets.length}</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/40">Active Tickets</p>
              </div>
              <div>
                <p className="font-display text-xl font-bold text-white">12</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/40">Events Attended</p>
              </div>
              <div>
                <p className="font-display text-xl font-bold text-white">7</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/40">Followed</p>
              </div>
            </div>
          </div>

          <nav className="mt-4 space-y-1 rounded-3xl border border-white/10 bg-[#111111] p-3">
            {sidebarNav.map((item) => (
              <button
                key={item.label}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  item.active
                    ? "bg-[#e31b23]/15 text-white"
                    : "text-white/55 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className={`size-4 ${item.active ? "text-[#e31b23]" : ""}`} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-4 rounded-3xl border border-[#e31b23]/30 bg-gradient-to-br from-[#e31b23]/15 to-[#111111] p-6">
            <p className="font-display text-lg font-semibold uppercase tracking-wide text-white">
              Refer & earn
            </p>
            <p className="mt-2 text-sm leading-6 text-white/55">
              Share Ringcraft with friends and get $25 fight credit for every signup.
            </p>
            <Button size="lg" className="mt-4 w-full rounded-full bg-[#e31b23] hover:bg-[#c3161d]">
              Invite friends
            </Button>
          </div>
        </aside>

        {/* Main */}
        <div className="space-y-10">
          <div>
            <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-white">
              Welcome back, <span className="text-[#e31b23]">Jordan</span>
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Here&apos;s what&apos;s happening in your boxing world.
            </p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Ticket, label: "Upcoming Fights", value: `${activeTickets.length} tickets`, sub: "Next: Canelo vs Crawford" },
              { icon: Trophy, label: "Rewards Points", value: "12,400", sub: "Redeem for 1 free ticket" },
              { icon: CalendarDays, label: "Next Event", value: "Sep 12", sub: "Madison Square Garden" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-[#111111] p-6">
                <div className="flex items-center justify-between">
                  <stat.icon className="size-5 text-[#e31b23]" />
                </div>
                <p className="mt-4 font-display text-2xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                  {stat.label}
                </p>
                <p className="mt-2 text-xs text-white/45">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* My tickets */}
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-6 w-1 rounded-full bg-[#e31b23]" />
                  <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#e31b23]">
                    My Tickets
                  </p>
                </div>
                <h2 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide text-white">
                  Your Seats
                </h2>
              </div>
              <Link
                href="/tickets"
                className="group flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white/80 transition hover:border-[#e31b23]/50 hover:text-white"
              >
                Buy more <ArrowRight className="size-4 text-[#e31b23] transition group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="mt-6">
              <TicketList tickets={myTickets} />
            </div>
          </div>

          {/* Next events for you */}
          <div>
            <h2 className="font-display text-3xl font-semibold uppercase tracking-wide text-white">
              Recommended for You
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {nextEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>

          {/* Favorites */}
          <div>
            <h2 className="font-display text-3xl font-semibold uppercase tracking-wide text-white">
              Favorite Fighters
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {favorites.map((fighter) => (
                <FighterCard key={fighter.id} fighter={fighter} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
