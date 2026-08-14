"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import type { LiveFeedResponse } from "@/shared/live";
import { fetchLiveFeed } from "@/lib/live-client";
import { SectionHeading } from "@/components/site/SectionHeading";
import { LiveEventHero } from "./LiveEventHero";
import { LiveEventCard } from "./LiveEventCard";
import { EmptyLiveState } from "./EmptyLiveState";

const POLL_INTERVAL_MS = 60_000;

export function LiveFeed() {
  const [feed, setFeed] = useState<LiveFeedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const cancelledRef = useRef(false);

  const runFetch = useCallback(async () => {
    return fetchLiveFeed();
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    const refreshNow = () => {
      runFetch()
        .then((data) => {
          if (cancelledRef.current) return;
          setFeed(data);
          setError(null);
          setLoading(false);
        })
        .catch((err) => {
          if (cancelledRef.current) return;
          setError(err instanceof Error ? err.message : "Failed to load live feed");
          setLoading(false);
        });
    };
    refreshNow();
    const interval = setInterval(refreshNow, POLL_INTERVAL_MS);
    return () => {
      cancelledRef.current = true;
      clearInterval(interval);
    };
  }, [runFetch]);

  async function refresh() {
    setRefreshing(true);
    try {
      const data = await runFetch();
      setFeed(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load live feed");
    } finally {
      setRefreshing(false);
    }
  }

  const live = feed?.live ?? [];
  const upcoming = feed?.upcoming ?? [];
  const completed = feed?.completed ?? [];
  const primaryLive = live[0];
  const otherLive = live.slice(1);

  return (
    <div className="text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(100%_120%_at_50%_-20%,rgba(227,27,35,0.25),transparent_55%)]" />
        <div className="relative mx-auto flex max-w-[1440px] flex-wrap items-end justify-between gap-4 px-4 py-8 sm:px-6 sm:py-14 lg:px-8">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
              <Link href="/" className="transition hover:text-white">Home</Link>
              <span className="text-[#e31b23]">/</span>
              <span className="text-white/70">Live</span>
            </div>
            <h1 className="mt-4 font-display text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
              Live <span className="text-[#e31b23]">Now</span>
            </h1>
          </div>
          {primaryLive ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e31b23] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white">
              <span className="relative flex size-2">
                <span className="live-dot inline-flex size-2 rounded-full bg-white" />
              </span>
              On air · {primaryLive.title}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white/60">
              <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
              {feed?.refreshedAt ? "Feed live · updated" : "Scanning sources"}
            </span>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-14 lg:px-8">
        {loading && !feed ? (
          <div className="space-y-8">
            <div className="h-[480px] animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-80 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />
              ))}
            </div>
          </div>
        ) : error && !feed ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-[#111111] px-6 py-16 text-center">
            <h2 className="font-display text-2xl font-semibold uppercase tracking-wide text-white">Could not load live fights</h2>
            <p className="max-w-md text-sm leading-7 text-white/55">{error}</p>
            <button
              type="button"
              onClick={() => void refresh()}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#e31b23] px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#c3161d]"
            >
              <RefreshCw className="size-4" /> Try again
            </button>
          </div>
        ) : (
          <>
            {primaryLive ? (
              <LiveEventHero event={primaryLive} />
            ) : (
              <EmptyLiveState />
            )}

            {otherLive.length > 0 ? (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {otherLive.map((event) => (
                  <LiveEventCard key={event.id} event={event} />
                ))}
              </div>
            ) : null}
          </>
        )}
      </section>

      {!loading && feed ? (
        <section className="border-t border-white/10 bg-[#0b0b0b]">
          <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
            <SectionHeading
              subtitle="Coming up next"
              title="Broadcast Schedule"
              description="Verified upcoming events from official sources across the platform."
              actionLabel="All events"
              actionHref="/events"
            />
            {upcoming.length > 0 ? (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {upcoming.map((event) => (
                  <LiveEventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <p className="mt-10 text-sm text-white/45">
                No verified upcoming broadcasts right now. Check back when a source schedules a fight.
              </p>
            )}
          </div>
        </section>
      ) : null}

      {!loading && feed && completed.length > 0 ? (
        <section className="border-t border-white/10">
          <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
            <SectionHeading
              subtitle="Recently completed"
              title="Videos & Results"
              description="Completed broadcasts from verified sources — full recordings, highlights and interviews."
              actionLabel="All videos"
              actionHref="/videos"
            />
            <div className="mt-10 space-y-3">
              {completed.slice(0, 5).map((event) => (
                <LiveEventCard key={event.id} event={event} variant="compact" />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
