"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  CalendarDays,
  Check,
  Loader2,
  MapPin,
  Minus,
  Plus,
  QrCode,
  Receipt,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { FaCcMastercard } from "react-icons/fa6";
import type { BoxingEvent, TicketItem } from "@/data/types";
import { ticketTiers } from "@/data/tickets";
import { addPurchasedTicket } from "@/lib/ticketStore";
import { formatMoney } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { AuthDialog } from "@/components/site/AuthDialog";
import { TicketQr } from "@/components/tickets/TicketQr";
import {
  CreditCardForm,
  type CardState,
  type CardValidity,
} from "@/components/ui/credit-card-form";

interface BuyTicketsCardProps {
  event: BoxingEvent;
}

type PurchaseStatus = "idle" | "processing" | "done";

const PAYMENT_LABEL = "Mastercard";
const cardBrandColors = ["#EB001B"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function BuyTicketsCard({ event }: BuyTicketsCardProps) {
  const router = useRouter();
  const { user, hydrated } = useAuth();
  const [selected, setSelected] = useState(0);
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState<PurchaseStatus>("idle");
  const [purchased, setPurchased] = useState<TicketItem[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [cardValid, setCardValid] = useState(false);
  const [cardError, setCardError] = useState(false);

  const signedIn = hydrated && Boolean(user);
  const soldOut = event.status === "Sellout";
  const tier = ticketTiers[selected];
  const total = tier.price * qty;

  function handlePurchase() {
    if (soldOut || status !== "idle") return;
    if (!signedIn) {
      setAuthOpen(true);
      return;
    }
    if (!cardValid) {
      setCardError(true);
      return;
    }
    setCardError(false);
    setStatus("processing");
    setTimeout(() => {
      const orderId = `BA-${Math.floor(100000 + Math.random() * 899999)}`;
      const eventCode = event.id
        .replace(/[^a-z0-9]/g, "")
        .toUpperCase()
        .slice(0, 10);
      const tickets: TicketItem[] = [];
      for (let i = 0; i < qty; i++) {
        tickets.push({
          id: `TK-${Date.now()}-${i}`,
          orderId,
          eventId: event.id,
          eventTitle: event.title,
          undercard: event.coMain ?? event.titles.join(" · "),
          venue: event.venue,
          city: event.city,
          date: event.date,
          time: event.time,
          gateOpen: "Doors open 1 hour before start",
          section: tier.section,
          row: String.fromCharCode(65 + Math.floor(Math.random() * 20)),
          seat: String(Math.floor(Math.random() * 24) + 1),
          price: tier.price,
          qr: `BA${eventCode}-${Math.floor(Math.random() * 9999)}`,
          status: "active",
          purchasedAt: new Date().toISOString(),
          paidWith: PAYMENT_LABEL,
        });
      }
      tickets.forEach(addPurchasedTicket);
      setPurchased(tickets);
      setStatus("done");
    }, 900);
  }

  if (status === "done" && purchased.length > 0) {
    const order = purchased[0];
    return (
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#111111]">
        {/* Receipt header */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-transparent p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-400">
              <Receipt className="size-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/40">
                Purchase receipt
              </p>
              <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-white">
                Order {order.orderId}
              </h3>
            </div>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-400">
            Paid · {PAYMENT_LABEL}
          </span>
        </div>

        {/* Event */}
        <div className="space-y-2 border-b border-white/10 p-6">
          <h4 className="font-display text-2xl font-semibold uppercase tracking-wide text-white">
            {event.title}
          </h4>
          <p className="flex items-center gap-1.5 text-xs text-white/50">
            <MapPin className="size-3.5 text-[#e31b23]" />
            {event.venue} · {event.city}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-white/50">
            <CalendarDays className="size-3.5 text-[#e31b23]" />
            {formatDate(event.date)} · {event.time} · {event.timezone}
          </p>
        </div>

        {/* Line items */}
        <div className="border-b border-white/10 p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/40">
            Order summary
          </p>
          <div className="mt-3 flex items-center justify-between gap-3 text-sm">
            <span className="text-white/75">
              {qty} × {tier.name} ticket{qty > 1 ? "s" : ""}
            </span>
            <span className="font-display font-semibold text-white">
              {formatMoney(tier.price)}
            </span>
          </div>
          <div className="mt-2 space-y-1.5">
            {purchased.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2 text-xs"
              >
                <span className="font-semibold uppercase tracking-wide text-white/80">
                  {t.section} · Row {t.row} · Seat {t.seat}
                </span>
                <span className="font-mono text-white/45">{t.id}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
            <span className="text-sm text-white/75">Subtotal</span>
            <span className="text-sm text-white/60">{formatMoney(total)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-3 text-sm">
            <span className="text-white/75">Taxes &amp; fees</span>
            <span className="text-emerald-400">Included</span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-3 text-sm">
            <span className="text-white/75">Paid with</span>
            <span className="flex items-center gap-1.5 text-white/80">
              <span className="grid size-5 place-items-center rounded bg-white">
                <FaCcMastercard className="h-3 w-auto text-[#EB001B]" />
              </span>
              {PAYMENT_LABEL}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-[#e31b23]/10 px-4 py-3">
            <span className="font-display text-base font-bold uppercase tracking-wide text-white">
              Total paid
            </span>
            <span className="font-display text-2xl font-bold text-white">
              {formatMoney(total)}
            </span>
          </div>
        </div>

        {/* QR + verification */}
        <div className="grid gap-6 border-b border-white/10 p-6 sm:grid-cols-[auto_1fr] sm:items-center">
          <TicketQr value={order.qr} size={168} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/40">
              Ticket verification
            </p>
            <p className="mt-2 text-sm leading-6 text-white/60">
              {qty} active ticket{qty > 1 ? "s" : ""} attached to order{" "}
              <span className="font-mono text-white/80">{order.orderId}</span>.
              Scan the QR at the gate for entry — present it from your device
              on the day of the event.
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-white/45">
              <QrCode className="size-3.5 text-[#e31b23]" />
              QR code {order.qr}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6">
          <div className="flex items-center justify-between gap-3 text-xs text-white/45">
            <span>Purchased {formatDate(order.purchasedAt)}</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-400" /> Backed by
              Pugnera ticket guarantee
            </span>
          </div>
          <div className="mt-5 flex w-full flex-col gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#e31b23] py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#c3161d]"
            >
              View my tickets <ArrowRight className="size-4" />
            </button>
            <button
              onClick={() => {
                setQty(1);
                setPurchased([]);
                setCardValid(false);
                setCardError(false);
                setStatus("idle");
              }}
              className="w-full cursor-pointer rounded-full border border-white/15 bg-white/5 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-white/80 transition hover:border-[#e31b23]/50 hover:text-white"
            >
              Buy another ticket
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-[#111111] p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-2xl font-semibold uppercase tracking-wide text-white">
          Ticket Tiers
        </h3>
        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/85">
          {event.ticketStatus}
        </span>
      </div>
      <p className="mt-2 text-xs text-white/45">
        {event.title} · Broadcast on {event.broadcaster}
      </p>

      <div className="mt-6 space-y-3">
        {ticketTiers.map((t, i) => {
          const isSelected = selected === i;
          return (
            <button
              key={t.name}
              onClick={() => {
                setSelected(i);
                setStatus("idle");
              }}
              disabled={soldOut}
              className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isSelected
                  ? "border-[#e31b23] bg-[#e31b23]/10"
                  : "border-white/10 bg-white/[0.03] hover:border-[#e31b23]/50"
              }`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span
                  className={`grid size-5 shrink-0 place-items-center rounded-full border-2 transition ${
                    isSelected ? "border-[#e31b23] bg-[#e31b23]" : "border-white/25"
                  }`}
                >
                  {isSelected && <Check className="size-3 text-white" />}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold uppercase text-white">
                    {t.name}
                  </p>
                  <p className="text-xs text-white/45">{t.desc}</p>
                </div>
              </div>
              <span className="shrink-0 font-display text-xl font-bold text-white">
                {formatMoney(t.price)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            Quantity
          </p>
          <div className="mt-1 flex items-center gap-3">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={soldOut}
              aria-label="Decrease quantity"
              className="grid size-8 cursor-pointer place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-[#e31b23]/50 hover:text-white disabled:opacity-40"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-6 text-center font-display text-lg font-bold text-white">
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => Math.min(8, q + 1))}
              disabled={soldOut}
              aria-label="Increase quantity"
              className="grid size-8 cursor-pointer place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-[#e31b23]/50 hover:text-white disabled:opacity-40"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            Total
          </p>
          <p className="font-display text-2xl font-bold text-white">
            {formatMoney(total)}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            Payment method
          </p>
          <span className="flex items-center gap-2">
            <span className="grid h-5 w-8 place-items-center rounded bg-white">
              <FaCcMastercard
                className="h-3 w-auto"
                style={{ color: cardBrandColors[0] }}
              />
            </span>
            <span className="text-[11px] font-semibold text-white/70">
              {PAYMENT_LABEL}
            </span>
          </span>
        </div>
        <div className="mt-4">
          <CreditCardForm
            maskMiddle
            showSubmit={false}
            onChange={(_state: CardState, validity: CardValidity) => {
              setCardValid(validity.allValid);
              setCardError(false);
            }}
          />
          {cardError && (
            <p className="mt-2 text-[11px] font-semibold text-[#ff6b6b]">
              Please complete all card fields to continue.
            </p>
          )}
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-white/40">
          <ShieldCheck className="size-3.5 text-emerald-400" /> Your payment
          details are encrypted and never stored.
        </p>
      </div>

      <button
        onClick={handlePurchase}
        disabled={soldOut || status === "processing"}
        className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#e31b23] py-4 font-display text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#c3161d] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "processing" ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Processing payment...
          </>
        ) : soldOut ? (
          <>
            <Ticket className="size-4" /> Sold out
          </>
        ) : signedIn ? (
          <>
            <Ticket className="size-4" /> Buy tickets now
          </>
        ) : (
          <>
            <Ticket className="size-4" /> Sign in to buy tickets
          </>
        )}
      </button>

      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        initialMode="signup"
      />

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <span className="flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
          <ShieldCheck className="size-4 text-emerald-400" /> Secure checkout
        </span>
        <span className="flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
          <QrCode className="size-4 text-emerald-400" /> Instant QR delivery
        </span>
        <span className="flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
          <Banknote className="size-4 text-emerald-400" /> Price match
        </span>
      </div>

      {soldOut && (
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-white/40">
          <BadgeCheck className="size-3.5 text-[#f5c518]" /> Join the waitlist
          to be first when more seats release.
        </p>
      )}
    </div>
  );
}
