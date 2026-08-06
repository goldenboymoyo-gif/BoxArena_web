"use client";

import { useState, useSyncExternalStore } from "react";
import { Barcode, CalendarDays, MapPin, Ticket, X } from "lucide-react";
import type { TicketItem } from "@/data/types";
import { formatMoney } from "@/lib/format";
import { ticketStatusLabels } from "@/data/tickets";
import { getStoredTickets, subscribeTickets } from "@/lib/ticketStore";
import { TicketQr } from "@/components/tickets/TicketQr";

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
  const [activeTicket, setActiveTicket] = useState<TicketItem | null>(null);
  const stored = useSyncExternalStore(
    subscribeTickets,
    getStoredTickets,
    () => []
  );

  const allTickets = [...stored, ...tickets];

  const filtered =
    filter === "all"
      ? allTickets
      : allTickets.filter((t) => t.status === filter);

  const countFor = (f: string) =>
    f === "all"
      ? allTickets.length
      : allTickets.filter((t) => t.status === f).length;

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
            {f === "all" ? "All" : ticketStatusLabels[f as keyof typeof ticketStatusLabels]} ({countFor(f)})
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
              <div className="grid shrink-0 place-items-center gap-1 rounded-xl bg-white p-3">
                <TicketQr value={ticket.qr} size={112} />
                <p className="max-w-[120px] truncate text-[8px] font-semibold text-black/70">
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
                  <button
                    onClick={() => setActiveTicket(ticket)}
                    className="mt-1 cursor-pointer rounded-full bg-[#e31b23] px-5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#c3161d]"
                  >
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

      {/* QR modal */}
      {activeTicket && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setActiveTicket(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`QR ticket for ${activeTicket.eventTitle}`}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-[#111111]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#e31b23]">
                  Mobile ticket
                </p>
                <h3 className="mt-1 font-display text-xl font-semibold uppercase tracking-wide text-white">
                  {activeTicket.eventTitle}
                </h3>
              </div>
              <button
                onClick={() => setActiveTicket(null)}
                aria-label="Close ticket"
                className="grid size-9 cursor-pointer place-items-center rounded-full border border-white/15 text-white/60 transition hover:border-[#e31b23]/50 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex flex-col items-center gap-4 p-6">
              <TicketQr value={activeTicket.qr} size={220} />
              <div className="w-full space-y-2.5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-white/50">
                    <MapPin className="size-3.5 text-[#e31b23]" /> Seat
                  </span>
                  <span className="font-display font-semibold uppercase text-white">
                    {activeTicket.section} · {activeTicket.row} · {activeTicket.seat}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-white/50">
                    <CalendarDays className="size-3.5 text-[#e31b23]" /> When
                  </span>
                  <span className="font-semibold text-white/80">
                    {formatDate(activeTicket.date)} · {activeTicket.time}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-white/50">
                    <Barcode className="size-3.5 text-[#e31b23]" /> Ticket ID
                  </span>
                  <span className="font-mono text-xs text-white/80">{activeTicket.id}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-white/50">Order</span>
                  <span className="font-mono text-xs text-white/80">{activeTicket.orderId}</span>
                </div>
              </div>
              <p className="text-center text-[11px] leading-5 text-white/45">
                Scan this code at the venue entrance. One scan per ticket — present
                it on your device for fast entry.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
