import Link from "next/link";
import { ArrowRight, Mail, MapPin } from "lucide-react";

const footerColumns = [
  {
    title: "Fights",
    links: [
      { label: "Upcoming Events", href: "/events" },
      { label: "Live Now", href: "/live" },
      { label: "Fight Replays", href: "/videos" },
      { label: "Event Calendar", href: "/events" },
      { label: "Pay-Per-View", href: "/events" },
    ],
  },
  {
    title: "Athletes",
    links: [
      { label: "Fighter Profiles", href: "/fighters" },
      { label: "Pound-for-Pound", href: "/rankings" },
      { label: "All Divisions", href: "/rankings" },
      { label: "The Legends", href: "/fighters#legends" },
      { label: "Champions", href: "/rankings" },
    ],
  },
  {
    title: "Media",
    links: [
      { label: "Latest News", href: "/news" },
      { label: "Video Highlights", href: "/videos" },
      { label: "Press Conferences", href: "/videos" },
      { label: "Documentaries", href: "/videos" },
      { label: "Interviews", href: "/videos" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About BoxArena", href: "/news" },
      { label: "Ticket Policy", href: "/tickets" },
      { label: "My Tickets", href: "/dashboard" },
      { label: "My Dashboard", href: "/dashboard" },
      { label: "Contact Us", href: "/tickets" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#050505] text-[#E5E7EB]">
      <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-[#e31b23] font-display text-lg font-bold tracking-[0.12em] text-white">
                B
              </div>
              <div className="flex flex-col">
                <span className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-white">
                  BoxArena
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/45">
                  The Home of Boxing
                </span>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-7 text-white/55">
              The premium digital ecosystem for professional boxing — live fights,
              tickets, rankings, news and highlights, all in one arena built for the
              fight fan.
            </p>
            <div className="space-y-2.5 text-sm text-white/55">
              <p className="flex items-center gap-2.5">
                <MapPin className="size-4 text-[#e31b23]" />
                Madison Square Garden, New York, USA
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="size-4 text-[#e31b23]" />
                hello@boxarena.com
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-bold uppercase tracking-[0.24em] text-white">
                  {col.title}
                </h4>
                <ul className="mt-5 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/50 transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/40">
            © 2026 BoxArena. All rights reserved. Not affiliated with any sanctioning
            body.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/40">
            <a href="#" className="transition hover:text-white">
              Terms of Service
            </a>
            <a href="#" className="transition hover:text-white">
              Privacy Policy
            </a>
            <Link href="/events" className="flex items-center gap-1 text-white/60 transition hover:text-white">
              View schedule <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
