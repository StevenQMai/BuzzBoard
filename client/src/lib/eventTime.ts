import type { Event } from "./utils";

/** Parse YYYY-MM-DD + HH:mm (from <input type="time">) in local time */
export function parseEventStart(e: Event): Date | null {
  if (!e.Date || !e.Start_time) return null;
  const d = new Date(`${e.Date}T${normalizeTime(e.Start_time)}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function parseEventEnd(e: Event): Date | null {
  if (!e.Date || !e.End_time) return null;
  const d = new Date(`${e.Date}T${normalizeTime(e.End_time)}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeTime(t: string): string {
  return t.length === 5 ? `${t}:00` : t;
}

/** Event's calendar day is today (local), using stored YYYY-MM-DD */
export function isEventToday(e: Event, now = new Date()): boolean {
  if (!e.Date) return false;
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return e.Date === `${y}-${m}-${d}`;
}

/** Use “Today” in the time-badge slot (right side of card) instead of “Starts in …” */
export function shouldShowTodayTimeBadge(e: Event, now = new Date()): boolean {
  return isEventToday(e) && !isPastEvent(e, now);
}

export function isPastEvent(e: Event, now = new Date()): boolean {
  const end = parseEventEnd(e);
  const start = parseEventStart(e);
  if (end) return end < now;
  if (start) return start < now;
  return false;
}

/** Next `hours` from now */
export function isStartingWithinHours(
  e: Event,
  hours: number,
  now = new Date()
): boolean {
  const start = parseEventStart(e);
  if (!start || start < now) return false;
  const limit = new Date(now.getTime() + hours * 60 * 60 * 1000);
  return start <= limit;
}

export function sortEventsByStartAsc(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    const ta = parseEventStart(a)?.getTime() ?? Infinity;
    const tb = parseEventStart(b)?.getTime() ?? Infinity;
    return ta - tb;
  });
}

export function formatTimeRange(e: Event): string {
  if (!e.Start_time || !e.End_time) return e.Start_time || "—";
  return `${formatClock(e.Start_time)} – ${formatClock(e.End_time)}`;
}

function formatClock(t: string): string {
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return t;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatEventDateHeading(e: Event): string {
  const start = parseEventStart(e);
  if (!start) return e.Date || "";
  return start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function relativeStartsIn(e: Event, now = new Date()): string | null {
  const start = parseEventStart(e);
  if (!start) return null;
  const diffMs = start.getTime() - now.getTime();
  if (diffMs < 0) return null;
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `Starts in ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `Starts in ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `Starts in ${days}d`;
}
