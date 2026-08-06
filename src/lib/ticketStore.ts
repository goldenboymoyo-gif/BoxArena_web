import type { TicketItem } from "@/data/types";

const STORAGE_KEY = "boxarena_tickets";

type Listener = () => void;

let snapshot: TicketItem[] | null = null;
const listeners = new Set<Listener>();

function read(): TicketItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as TicketItem[]) : [];
  } catch {
    return [];
  }
}

export function getStoredTickets(): TicketItem[] {
  if (snapshot === null) snapshot = read();
  return snapshot;
}

export function subscribeTickets(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function addPurchasedTicket(ticket: TicketItem) {
  const next = [ticket, ...getStoredTickets()];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable — ignore
  }
  snapshot = next;
  listeners.forEach((listener) => listener());
}

export function clearStoredTickets() {
  snapshot = [];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch {
    // Storage unavailable — ignore
  }
  listeners.forEach((listener) => listener());
}
