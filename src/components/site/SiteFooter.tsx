import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

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

const socials = [
  { label: "Facebook", href: "https://facebook.com", Icon: FaFacebookF },
  { label: "Instagram", href: "https://instagram.com", Icon: FaInstagram },
  { label: "X (Twitter)", href: "https://x.com", Icon: FaXTwitter },
  { label: "YouTube", href: "https://youtube.com", Icon: FaYoutube },
];

const legalLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Cookies", href: "#" },
  { label: "Accessibility", href: "#" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#050505] text-[#E5E7EB]">
      <div className="mx-auto max-w-[1440px] px-6 pt-24 pb-28 lg:px-8 lg:pb-20">
        <div className="grid gap-14 lg:grid-cols-[2.6fr_1fr_1fr_1fr_1fr] lg:gap-12">
          {/* Logo & company */}
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center">
              <img
                src="/logo.png"
                alt="BoxArena — The Home of Boxing"
                className="h-10 w-auto mix-blend-screen"
              />
            </Link>
            <p className="mt-7 text-sm leading-7 text-white/55">
              The premium digital platform for professional boxing. Discover
              events, rankings, fighters, live results, tickets, and exclusive
              content from around the world.
            </p>
            <div className="mt-9 space-y-4 text-sm text-white/55">
              <p className="flex items-center gap-3">
                <MapPin className="size-4 shrink-0 text-[#e31b23]" />
                Madison Square Garden, New York, USA
              </p>
              <a
                href="mailto:hello@boxarena.com"
                className="flex items-center gap-3 transition-colors hover:text-white"
              >
                <Mail className="size-4 shrink-0 text-[#e31b23]" />
                hello@boxarena.com
              </a>
            </div>
            <div className="mt-10 flex items-center gap-3">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#e31b23]/60 hover:bg-[#e31b23]/10 hover:text-[#e31b23]"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold uppercase tracking-[0.3em] text-white">
                {col.title}
              </h4>
              <ul className="mt-10 space-y-[18px]">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] leading-relaxed text-white/50 transition-colors duration-200 hover:text-[#e31b23]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center gap-5 border-t border-white/10 pt-9 sm:flex-row sm:justify-between">
          <p className="text-xs text-white/40">
            © 2026 BoxArena. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            {legalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs text-white/40 transition-colors duration-200 hover:text-[#e31b23]"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
