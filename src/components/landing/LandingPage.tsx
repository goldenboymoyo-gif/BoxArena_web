"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  Play,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionHeading } from "@/components/site/SectionHeading";

const upcomingEvents = [
  {
    headline: "World Heavyweight Championship",
    matchup: "Ortiz vs. Wilder",
    date: "Sep 24",
    arena: "Madison Square Garden",
    time: "21:00 ET",
    status: "Main Event",
  },
  {
    headline: "European Title Fight",
    matchup: "Ngannou vs. Ruiz",
    date: "Oct 08",
    arena: "O2 Arena",
    time: "18:30 BST",
    status: "Undercard",
  },
  {
    headline: "Live Fight Night",
    matchup: "Rodriguez vs. Silva",
    date: "Oct 15",
    arena: "T-Mobile Arena",
    time: "20:00 PT",
    status: "Featured",
  },
];

const fighters = [
  {
    name: "Mason Hayes",
    record: "28-1-0",
    division: "Cruiserweight",
    country: "USA",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Luca Bianchi",
    record: "22-2-0",
    division: "Welterweight",
    country: "ITA",
    image:
      "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Isaiah Cruz",
    record: "19-0-0",
    division: "Light Heavyweight",
    country: "MEX",
    image:
      "https://images.unsplash.com/photo-1491022610646-9ed014bc7b42?auto=format&fit=crop&w=900&q=80",
  },
];

const news = [
  {
    title: "Championship belts headline the fall calendar",
    category: "News",
    summary: "The boxing world is set for back-to-back premium events with global title fights and international contenders.",
  },
  {
    title: "Live analytics arrive for every fight",
    category: "Insights",
    summary: "BoxArena launches real-time performance tracking, delivering pro-level statistics during live streams.",
  },
  {
    title: "Tickets sold out for the arena premiere",
    category: "Events",
    summary: "The latest event in Las Vegas reaches capacity within hours as fans demand premium boxing entertainment.",
  },
];

const sponsors = ["DAZN", "EVELAST", "RING", "NOVA", "VOLT"];

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <p className="text-sm uppercase tracking-[0.28em] text-[#f8fafc]/70">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(225,6,0,0.24),transparent_28%),linear-gradient(180deg,rgba(11,11,11,0.12),#0b0b0b_60%)]" />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-80"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1600&q=80')",
            }}
          />
          <div className="relative mx-auto max-w-[1440px] px-6 py-24 sm:py-28 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="max-w-2xl"
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-[#FFFFFF]/10 bg-[#FFFFFF]/5 px-4 py-2 text-sm uppercase tracking-[0.3em] text-[#FFC107] shadow-[0_0_45px_rgba(225,16,0,0.08)]">
                  <Play className="size-4" /> Live stream now
                </span>
                <h1 className="mt-8 text-5xl font-semibold tracking-tight text-white sm:text-6xl xl:text-7xl">
                  Where Professional Boxing Lives.
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-8 text-[#F5F5F5]/80 sm:text-xl">
                  Watch live fights. Buy tickets. Follow champions. Discover the future of professional boxing in one premium digital arena.
                </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Button className="rounded-full bg-[#E10600] px-8 py-4 text-sm font-semibold tracking-[0.16em] uppercase shadow-[0_18px_50px_rgba(225,16,0,0.18)] hover:bg-[#c30600]" size="lg">
                    Watch Live
                  </Button>
                  <Button variant="outline" className="rounded-full border-white/15 px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white shadow-[0_18px_50px_rgba(0,0,0,0.18)] hover:border-[#E10600]/30 hover:bg-white/5" size="lg">
                    Explore Events
                  </Button>
                </div>
                <div className="mt-12 grid gap-4 sm:grid-cols-3">
                  <StatCard label="Live Events" value="7" />
                  <StatCard label="Champions" value="24" />
                  <StatCard label="Tickets" value="82K" />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                className="space-y-6"
              >
                {upcomingEvents.map((event) => (
                  <Card key={event.matchup} className="overflow-hidden bg-[#121212] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
                    <CardHeader className="px-6 pt-6">
                      <div className="flex items-center justify-between gap-4 text-sm text-[#F5F5F5]/70">
                        <span className="uppercase tracking-[0.28em] text-[#FFC107]">{event.status}</span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                          <CalendarDays className="size-4" /> {event.date}
                        </span>
                      </div>
                      <CardTitle className="mt-4 text-2xl text-white">{event.headline}</CardTitle>
                      <CardDescription className="mt-2 text-[#F5F5F5]/70">{event.matchup}</CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pt-4 pb-6">
                      <div className="flex flex-col gap-3 text-sm text-[#F5F5F5]/75 sm:flex-row sm:items-center sm:justify-between">
                        <p>{event.arena}</p>
                        <p>{event.time}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        <section id="fighters" className="mx-auto max-w-[1440px] px-6 py-20 lg:px-8">
          <SectionHeading title="Featured Fighters" subtitle="Pro Talent" />
          <div className="grid gap-6 xl:grid-cols-3">
            {fighters.map((fighter) => (
              <motion.div
                key={fighter.name}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#141414] shadow-[0_20px_80px_rgba(0,0,0,0.2)]"
              >
                <div
                  className="h-72 bg-cover bg-center"
                  style={{ backgroundImage: `url(${fighter.image})` }}
                />
                <div className="space-y-4 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-3xl font-semibold text-white">{fighter.name}</p>
                      <p className="mt-2 text-sm uppercase tracking-[0.2em] text-[#F5F5F5]/60">{fighter.division}</p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-[#ffffff0d] px-4 py-2 text-xs uppercase tracking-[0.24em] text-[#FFC107]">
                      Verified
                    </div>
                  </div>
                  <div className="grid gap-2 text-sm text-[#F5F5F5]/70">
                    <p>Record: <span className="text-white">{fighter.record}</span></p>
                    <p>Nation: <span className="text-white">{fighter.country}</span></p>
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-4">
                    <Button variant="outline" className="rounded-full px-5 py-3 text-sm uppercase tracking-[0.18em] text-white/90 hover:bg-white/5">
                      View profile
                    </Button>
                    <Button className="rounded-full bg-[#E10600] px-5 py-3 text-sm uppercase tracking-[0.18em]">
                      Follow
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="live" className="border-t border-white/10 bg-[#080808]">
          <div className="mx-auto max-w-[1440px] px-6 py-20 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-[#E10600]/20 bg-[#E10600]/10 px-4 py-2 text-sm uppercase tracking-[0.28em] text-[#FFC107]">
                  <Sparkles className="size-4" /> Live Now
                </div>
                <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Live stream the next generation of boxing championship moments.
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-[#F5F5F5]/75">
                  Follow every round in premium quality, with rich commentary, live scorecards, and curated highlights for the moments that move the sport forward.
                </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Button className="rounded-full bg-[#E10600] px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] shadow-[0_18px_50px_rgba(225,16,0,0.18)]">
                    Watch live
                  </Button>
                  <Button variant="outline" className="rounded-full border-white/15 px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] hover:bg-white/5">
                    View schedule
                  </Button>
                </div>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-[#131313]/80 p-8 shadow-[0_40px_90px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between gap-4 text-sm text-[#F5F5F5]/70">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2">Live broadcast</span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-[#FFC107]">
                    <Clock3 className="size-4" /> 1:12:43
                  </span>
                </div>
                <div className="mt-8 space-y-5">
                  <div className="rounded-[1.75rem] bg-[#161616] p-6">
                    <div className="flex items-center justify-between gap-3 text-sm text-[#F5F5F5]/70">
                      <span>World Heavyweight</span>
                      <span className="text-[#FFC107]">Round 10</span>
                    </div>
                    <h3 className="mt-4 text-2xl font-semibold text-white">Joshua vs. Ortiz</h3>
                    <p className="mt-3 text-sm leading-6 text-[#F5F5F5]/70">
                      Championship duel with global commentary, live pulse stats, and in-app ticket access.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard label="Venue" value="MSG" />
                    <StatCard label="Attendance" value="18.6K" />
                    <StatCard label="Stream" value="Premium" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="news" className="mx-auto max-w-[1440px] px-6 py-20 lg:px-8">
          <SectionHeading title="Latest News" subtitle="Inside the ring" />
          <div className="grid gap-6 xl:grid-cols-3">
            {news.map((item) => (
              <Card key={item.title} className="overflow-hidden bg-[#121212] border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.18)]">
                <CardContent className="space-y-5 px-6 py-8">
                  <div className="flex items-center justify-between gap-4 text-xs uppercase tracking-[0.3em] text-[#FFC107]/85">
                    <span>{item.category}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Featured</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-white">{item.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-[#F5F5F5]/70">{item.summary}</p>
                  </div>
                </CardContent>
                <CardFooter className="justify-between px-6 py-5">
                  <span className="text-sm text-[#F5F5F5]/70">Read more</span>
                  <ArrowRight className="size-5 text-[#FFC107]" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#090909] py-16">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-6 lg:px-8">
            <div className="flex items-center justify-between gap-5">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-[#FFC107]/80">Partners</p>
                <h3 className="mt-3 text-3xl font-semibold text-white">Premium sponsors powering the fight night experience.</h3>
              </div>
              <Button variant="outline" className="rounded-full px-6 py-3 text-sm uppercase tracking-[0.18em] text-white/90 hover:bg-white/5">
                Partner with us
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
              {sponsors.map((sponsor) => (
                <div key={sponsor} className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-lg font-semibold uppercase tracking-[0.18em] text-white/80 shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                  {sponsor}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#070707] py-10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 text-[#F5F5F5]/70 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-semibold text-white">BoxArena</p>
            <p className="mt-2 max-w-md text-sm leading-6">The digital ecosystem for professional boxing. One platform for fans, fighters, coaches, promoters, and media.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <a href="#" className="transition hover:text-white">Terms</a>
            <a href="#" className="transition hover:text-white">Privacy</a>
            <a href="#" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white transition hover:border-[#E10600]/40 hover:bg-[#E10600]/10">
              Explore more <ChevronRight className="size-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
