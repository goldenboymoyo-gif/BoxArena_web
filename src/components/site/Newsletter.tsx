"use client";

import { useState } from "react";
import { Check, Loader2, Send } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    window.setTimeout(() => {
      setStatus("done");
      setEmail("");
    }, 700);
  }

  return (
    <section className="relative overflow-hidden border-t border-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_120%,rgba(227,27,35,0.18),transparent_70%)]" />
      <div className="relative mx-auto max-w-[1440px] px-6 py-20 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-white/70">
            <span className="relative flex size-2">
              <span className="live-dot inline-flex size-2 rounded-full bg-[#e31b23]" />
            </span>
            Fight Alerts
          </span>
          <h2 className="mt-5 font-display text-4xl font-semibold uppercase tracking-wide text-white sm:text-5xl">
            Never Miss a{" "}
            <span className="text-[#e31b23]">Fight Night</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/55">
            Join the Inner Circle and get fight announcements, ticket pre-sales
            and breaking news straight to your inbox — before anyone else.
          </p>

          {status === "done" ? (
            <div className="mt-8 flex w-full max-w-md items-center justify-center gap-2.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-6 py-4">
              <span className="grid size-6 place-items-center rounded-full bg-emerald-400 text-black">
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              <p className="text-sm font-semibold text-emerald-300">
                You&apos;re in! Check your inbox to confirm.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
            >
              <div className="flex-1">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "error") setStatus("idle");
                  }}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  className={`w-full rounded-full border bg-white/5 px-6 py-4 text-sm text-white outline-none transition placeholder:text-white/40 focus:bg-white/[0.08] ${
                    status === "error"
                      ? "border-[#e31b23]/70"
                      : "border-white/10 focus:border-[#e31b23]/60"
                  }`}
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#e31b23] px-7 py-4 font-display text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#c3161d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "loading" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Subscribe
              </button>
            </form>
          )}

          {status === "error" && (
            <p className="mt-3 text-xs font-medium text-[#ff6b70]">
              Please enter a valid email address.
            </p>
          )}

          <p className="mt-5 text-xs text-white/35">
            No spam, ever. Unsubscribe anytime with one click.
          </p>
        </div>
      </div>
    </section>
  );
}
