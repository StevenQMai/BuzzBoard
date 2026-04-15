import ICAL from "ical.js";

export type ClassBlock = {
  summary: string;
  daysOfWeek: number[]; // 0=Sun..6=Sat
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  buildingKey: string;
};

function toHHmm(d: Date): string {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function normalizeBuildingKey(location: string): string {
  return location
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(room|rm|suite|ste)\b/g, " ")
    .replace(/[0-9]+/g, " ")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const BYDAY_TO_DOW: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

function uniqueSorted(nums: number[]): number[] {
  return Array.from(new Set(nums)).sort((a, b) => a - b);
}

function getDaysOfWeekFromRRule(vevent: ICAL.Component): number[] {
  const rrule = vevent.getFirstPropertyValue("rrule") as
    | ICAL.Recur
    | undefined;
  if (!rrule) return [];

  // ical.js stores RRULE parts under .parts.BYDAY (array of strings like "MO", "WE", "FR")
  const parts = (rrule as any).parts as Record<string, unknown> | undefined;
  const byday = (parts?.BYDAY ?? (rrule as any).byday) as
    | Array<string | { day: string }>
    | undefined;
  if (!byday || !Array.isArray(byday)) return [];

  const dows = byday
    .map((v) => (typeof v === "string" ? v : v?.day))
    .filter(Boolean)
    .map((code) => BYDAY_TO_DOW[String(code)] ?? null)
    .filter((n): n is number => typeof n === "number");

  return uniqueSorted(dows);
}

function getDaysOfWeekFallbackFromDtStart(dtStart: ICAL.Time | null): number[] {
  if (!dtStart) return [];
  const js = dtStart.toJSDate();
  return [js.getDay()];
}

export function parseScheduleICS(icsText: string): ClassBlock[] {
  const jcal = ICAL.parse(icsText);
  const comp = new ICAL.Component(jcal);
  const vevents = comp.getAllSubcomponents("vevent");

  const blocks: ClassBlock[] = [];

  for (const vevent of vevents) {
    const event = new ICAL.Event(vevent);
    const summary = String(event.summary || "").trim();
    const location = String(event.location || "").trim();

    const dtStart = event.startDate ?? vevent.getFirstPropertyValue("dtstart");
    const dtEnd = event.endDate ?? vevent.getFirstPropertyValue("dtend");

    if (!dtStart || !dtEnd) continue;

    const start = dtStart.toJSDate();
    const end = dtEnd.toJSDate();

    const daysOfWeek = uniqueSorted([
      ...getDaysOfWeekFromRRule(vevent),
      ...getDaysOfWeekFallbackFromDtStart(dtStart),
    ]);

    blocks.push({
      summary: summary || "Class",
      daysOfWeek,
      startTime: toHHmm(start),
      endTime: toHHmm(end),
      location,
      buildingKey: normalizeBuildingKey(location),
    });
  }

  // Deduplicate identical blocks (common when ICS contains multiple sections)
  const seen = new Set<string>();
  const deduped: ClassBlock[] = [];
  for (const b of blocks) {
    const key = `${b.summary}|${b.daysOfWeek.join(",")}|${b.startTime}-${b.endTime}|${b.buildingKey}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(b);
  }

  return deduped;
}

