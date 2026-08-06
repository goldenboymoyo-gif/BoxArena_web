import Link from "next/link";
import {
  Banknote,
  CalendarDays,
  CreditCard,
  MapPin,
  QrCode,
  ShieldCheck,
  Ticket,
  TicketPercent,
} from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { EventCard } from "@/components/cards/EventCard";
import { BuyTicketsCard } from "@/components/tickets/BuyTicketsCard";
import { events, getEvent, heroEvent } from "@/data/events";

export const metadata = {
  title: "Tickets",
  description:
    "Buy tickets to the biggest boxing events — championship nights, premium packages and secure checkout.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const { event } = await searchParams;
  const featured = (event ? getEvent(event) : undefined) ?? heroEvent;
  const onSale = events.filter((e) => e.status !== "Sellout");

  return (
    <div className="text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(100%_120%_at_50%_-20%,rgba(227,27,35,0.25),transparent_55%)]" />
        <div className="relative mx-auto max-w-[1440px] px-6 py-16 lg:px-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
            <Link href="/" className="transition hover:text-white">Home</Link>
            <span className="text-[#e31b23]">/</span>
            <span className="text-white/70">Tickets</span>
          </div>
          <h1 className="mt-4 font-display text-5xl font-bold uppercase tracking-tight text-white sm:text-6xl">
            Fight Night <span className="text-[#e31b23]">Tickets</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
            Secure your seat at the biggest nights in boxing. Official tickets,
            secure checkout and instant digital delivery.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-white/60">
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-400" /> 100% official tickets
            </span>
            <span className="flex items-center gap-2">
              <QrCode className="size-4 text-emerald-400" /> Instant QR delivery
            </span>
            <span className="flex items-center gap-2">
              <Banknote className="size-4 text-emerald-400" /> Price match guarantee
            </span>
          </div>
        </div>
      </section>

      {/* Featured event ticket */}
      <section className="mx-auto max-w-[1440px] px-6 py-14 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="relative overflow-hidden rounded-3xl border border-white/10">
            <img
              src={featured.posterImage}
              alt={featured.title}
              className="img-zoom h-full min-h-[380px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#e31b23] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white">
                <Ticket className="size-4" /> Featured
              </span>
              <h2 className="mt-4 max-w-xl font-display text-4xl font-semibold uppercase leading-tight tracking-wide text-white sm:text-5xl">
                {featured.title}
              </h2>
              <p className="mt-2 max-w-lg text-sm text-white/60">{featured.headline}</p>
              <div className="mt-4 flex flex-wrap gap-5 text-sm text-white/70">
                <span className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-[#e31b23]" />
                  {formatDate(featured.date)}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="size-4 text-[#e31b23]" />
                  {featured.venue}, {featured.city}
                </span>
              </div>
            </div>
          </div>

          <BuyTicketsCard event={featured} />
        </div>
      </section>

      {/* Events with tickets */}
      <section className="border-t border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-8">
          <SectionHeading
            subtitle="On sale now"
            title="Events with Tickets"
            description="Every event currently selling — status, prices and seat categories."
            actionLabel="My tickets"
            actionHref="/dashboard"
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {onSale.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-[1440px] px-6 py-16 lg:px-8">
        <SectionHeading
          subtitle="Simple & secure"
          title="How It Works"
          description="From checkout to the front gate in four easy steps."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Ticket, title: "Pick your event", desc: "Choose a championship night from our full schedule." },
            { icon: CreditCard, title: "Select your seat", desc: "Browse ticket tiers and choose the perfect view." },
            { icon: QrCode, title: "Instant QR", desc: "Your tickets are delivered straight to your dashboard." },
            { icon: ShieldCheck, title: "Scan at the gate", desc: "Show your QR at the venue and walk straight in." },
          ].map((step, i) => (
            <div key={step.title} className="relative rounded-2xl border border-white/10 bg-[#111111] p-6">
              <span className="absolute right-5 top-5 font-display text-4xl font-bold text-white/10">
                {String(i + 1).padStart(2, "0")}
              </span>
              <step.icon className="size-6 text-[#e31b23]" />
              <h3 className="mt-4 font-display text-lg font-semibold uppercase tracking-wide text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/50">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-6 rounded-3xl border border-white/10 bg-gradient-to-r from-[#e31b23]/15 to-[#111111] p-8 lg:flex-row">
          <div className="flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-2xl bg-[#e31b23] text-white">
              <TicketPercent className="size-7" />
            </span>
            <div>
              <h3 className="font-display text-2xl font-semibold uppercase tracking-wide text-white">
                Member discount
              </h3>
              <p className="mt-1 text-sm text-white/55">
                Sign up free to unlock presale access and 10% off all tickets.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="rounded-full bg-[#e31b23] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#c3161d]"
            >
              My tickets
            </Link>
            <Link
              href="/events"
              className="rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:border-[#e31b23]/50"
            >
              Browse events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
