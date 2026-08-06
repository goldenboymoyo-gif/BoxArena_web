"use client";

import { useState } from "react";
import { Barcode, MapPin, QrCode, Ticket } from "lucide-react";
import type { TicketItem } from "@/data/types";
import { formatMoney } from "@/lib/format";
import { ticketStatusLabels } from "@/data/tickets";

interface TicketListProps {
  tickets: TicketItem[];
}

const statusStyles: Record<TicketItem["status"], string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  used: "bg-white/5 text-white/50 border-white/10",
  pending: "bg-[#f5c518]/15 text-[#f5c518] border-[#f5c518]/30",
  refunded: "bg-[#e31b23]/15 text-[#ff6a6a] border-[#e31b23]/30",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TicketList({ tickets }: TicketListProps) {
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all" ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {["all", "active", "used", "pending", "refunded"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition ${
              filter === f
                ? "border-[#e31b23] bg-[#e31b23] text-white"
                : "border-white/15 bg-white/5 text-white/60 hover:border-[#e31b23]/50 hover:text-white"
            }`}
          >
            {f === "all" ? "All" : ticketStatusLabels[f as keyof typeof ticketStatusLabels]} ({f === "all" ? tickets.length : tickets.filter((t) => t.status === f).length})
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {filtered.map((ticket) => (
          <div
            key={ticket.id}
            className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]"
          >
            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
              {/* Fake QR */}
              <div className="grid shrink-0 place-items-center gap-1 rounded-xl bg-white p-3">
                <QrCode className="size-14 text-black" />
                <p className="max-w-[76px] truncate text-[8px] font-semibold text-black/70">
                  {ticket.qr}
                </p>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
                    {ticket.orderId}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${statusStyles[ticket.status]}`}
                  >
                    {ticketStatusLabels[ticket.status]}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-2xl font-semibold uppercase tracking-wide text-white">
                  {ticket.eventTitle}
                </h3>
                <p className="mt-1 text-xs text-white/45">{ticket.undercard}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/60">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-[#e31b23]" />
                    {ticket.venue} · {ticket.city}
                  </span>
                  <span>{formatDate(ticket.date)} · {ticket.time}</span>
                  <span className="font-display text-base font-bold text-white">
                    {formatMoney(ticket.price)}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-2 border-white/10 sm:items-end sm:border-l sm:pl-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Section · Row · Seat
                </p>
                <p className="font-display text-lg font-semibold uppercase text-white">
                  {ticket.section} · {ticket.row} · {ticket.seat}
                </p>
                <span className="flex items-center gap-1.5 text-xs text-white/45">
                  <Barcode className="size-4 text-[#e31b23]" /> {ticket.id}
                </span>
                {ticket.status === "active" && (
                  <button className="mt-1 rounded-full bg-[#e31b23] px-5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#c3161d]">
                    View QR
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 p-12 text-center">
            <Ticket className="size-8 text-white/30" />
            <p className="text-sm text-white/50">No {filter} tickets found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
