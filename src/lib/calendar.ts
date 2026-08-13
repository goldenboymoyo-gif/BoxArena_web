import type { BoxingEvent } from "@/data/types";

const TZ_OFFSETS: Record<string, string> = {
  ET: "-0400",
  PT: "-0700",
  GMT: "+0000",
  AST: "+0300",
  JST: "+0900",
};

const DURATION_MINUTES = 180;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function icsDateTime(d: Date, offset: string): string {
  const sign = offset.startsWith("+") ? 1 : -1;
  const hh = parseInt(offset.slice(1, 3), 10);
  const mm = parseInt(offset.slice(3, 5), 10);
  const shifted = new Date(d.getTime() + sign * (hh * 60 + mm) * 60000);
  return (
    `${shifted.getUTCFullYear()}` +
    `${pad(shifted.getUTCMonth() + 1)}${pad(shifted.getUTCDate())}` +
    `T${pad(shifted.getUTCHours())}${pad(shifted.getUTCMinutes())}00${offset}`
  );
}

function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function eventStartIcs(event: BoxingEvent): string {
  const offset = TZ_OFFSETS[event.timezone] ?? "-0400";
  const time = event.time.split(" ")[0] ?? "20:00";
  const [h = 20, m = 0] = time.split(":").map(Number);
  const d = new Date(`${event.date}T00:00:00`);
  d.setHours(h, m, 0, 0);
  return icsDateTime(d, offset);
}

export function eventEndIcs(event: BoxingEvent): string {
  const offset = TZ_OFFSETS[event.timezone] ?? "-0400";
  const time = event.time.split(" ")[0] ?? "20:00";
  const [h = 20, m = 0] = time.split(":").map(Number);
  const d = new Date(`${event.date}T00:00:00`);
  d.setHours(h, m, 0, 0);
  d.setMinutes(d.getMinutes() + DURATION_MINUTES);
  return icsDateTime(d, offset);
}

export function buildIcs(event: BoxingEvent): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "")
    .replace("Z", "Z");
  const location = `${event.venue}, ${event.city}`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pugnera//Boxing Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@pugnera.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${eventStartIcs(event)}`,
    `DTEND:${eventEndIcs(event)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(event.headline)}`,
    `LOCATION:${escapeIcs(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcs(event: BoxingEvent): void {
  const blob = new Blob([buildIcs(event)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.id}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
