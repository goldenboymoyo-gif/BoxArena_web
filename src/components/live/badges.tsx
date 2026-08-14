import { ShieldCheck } from "lucide-react";
import type { AccessModel, EventStatus, VerificationTier } from "@/shared/live";
import { accessLabel, tierLabel } from "@/shared/live";

export function AccessBadge({ access, className = "" }: { access: AccessModel; className?: string }) {
  const styles =
    access.kind === "free"
      ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
      : access.kind === "subscription"
        ? "border-sky-500/30 bg-sky-500/15 text-sky-400"
        : "border-[#f5c518]/30 bg-[#f5c518]/15 text-[#f5c518]";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${styles} ${className}`}>
      {access.kind === "free" ? "Free to watch" : accessLabel(access)}
    </span>
  );
}

export function StatusBadge({ status, className = "" }: { status: EventStatus; className?: string }) {
  if (status === "live") {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#e31b23] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white ${className}`}>
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/80" />
          <span className="live-dot relative inline-flex size-1.5 rounded-full bg-white" />
        </span>
        Live
      </span>
    );
  }
  if (status === "upcoming") {
    return (
      <span className={`inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/70 ${className}`}>
        Upcoming
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/50 ${className}`}>
      Completed
    </span>
  );
}

export function TierBadge({ tier, className = "" }: { tier: VerificationTier | null; className?: string }) {
  const label = tierLabel(tier);
  if (!label) return null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/60 ${className}`}>
      <ShieldCheck className="size-3 text-emerald-400" />
      {label}
    </span>
  );
}
