import type { Event } from "@/lib/utils";
import type { ClassBlock } from "@/lib/scheduleParser";
import { parseEventEnd, parseEventStart } from "@/lib/eventTime";
import {
  getCoords,
  haversineDistanceMeters,
  matchBuildingKey,
} from "@/lib/campusBuildings";

export type EventScheduleScores = {
  score: number; // 0..1
  scheduleFit: number; // 0 or 1
  proximity: number; // 0..1
  timeSoon: number; // 0..1
  tags: string[];
  nearBuildingLabel?: string;
};

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function hhmmToMinutes(t: string): number | null {
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

function classesForDow(schedule: ClassBlock[], dow: number): ClassBlock[] {
  return schedule.filter((c) => c.daysOfWeek.includes(dow));
}

/**
 * Returns 1 if the event fits a free slot, 0 if it overlaps a class,
 * or null if there are no classes that day (meaning fit is unknown/neutral).
 */
function computeScheduleFit(
  eventStartMin: number,
  eventEndMin: number,
  classes: ClassBlock[]
): number | null {
  if (classes.length === 0) return null;
  for (const c of classes) {
    const cs = hhmmToMinutes(c.startTime);
    const ce = hhmmToMinutes(c.endTime);
    if (cs == null || ce == null) continue;
    if (overlaps(eventStartMin, eventEndMin, cs, ce)) return 0;
  }
  return 1;
}

/**
 * Find the class on this day that is *physically closest* to the event,
 * so "Near X" reflects the actual closest class building.
 */
function findSpatiallyNearestClass(
  event: Event,
  classes: ClassBlock[]
): { classBlock: ClassBlock; distance: number } | null {
  const eventCoords = getCoords(event.Location || "");
  let best: { classBlock: ClassBlock; distance: number } | null = null;

  for (const c of classes) {
    const classCoords = getCoords(c.location || "");
    const d = haversineDistanceMeters(eventCoords, classCoords);
    if (!best || d < best.distance) best = { classBlock: c, distance: d };
  }

  return best;
}

function computeProximity(
  event: Event,
  classes: ClassBlock[]
): {
  proximity: number;
  nearBuildingLabel?: string;
} {
  const nearest = findSpatiallyNearestClass(event, classes);
  if (!nearest) return { proximity: 0 };

  const proximity = clamp01(1 - nearest.distance / 1500);

  // Try the class building name first; fall back to the event's own building if
  // the class building isn't recognized (avoids suppressing the tag entirely).
  const classKey = matchBuildingKey(nearest.classBlock.location || "");
  const eventKey = matchBuildingKey(event.Location || "");
  const labelKey = classKey || eventKey;
  const nearBuildingLabel = labelKey
    ? labelKey
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : undefined;

  return { proximity, nearBuildingLabel };
}

export function scoreEventsForSchedule(
  eventsInChronologicalOrder: Event[],
  schedule: ClassBlock[]
): Record<string, EventScheduleScores> {
  const n = eventsInChronologicalOrder.length;
  const scores: Record<string, EventScheduleScores> = {};

  for (let i = 0; i < n; i++) {
    const e = eventsInChronologicalOrder[i];
    const start = parseEventStart(e);
    const end = parseEventEnd(e);

    const timeSoon = n <= 1 ? 1 : clamp01(1 - i / (n - 1));

    if (!start || !end) {
      scores[e.id] = {
        score: 0,
        scheduleFit: 0,
        proximity: 0.5,
        timeSoon,
        tags: [],
      };
      continue;
    }

    const dow = start.getDay();
    const classes = classesForDow(schedule, dow);

    const eventStartMin = start.getHours() * 60 + start.getMinutes();
    const eventEndMin = end.getHours() * 60 + end.getMinutes();

    const scheduleFitResult = computeScheduleFit(eventStartMin, eventEndMin, classes);
    const { proximity, nearBuildingLabel } = computeProximity(e, classes);

    // When scheduleFit is null (no classes that day), treat it as neutral (0.5)
    const fitValue = scheduleFitResult ?? 0.5;
    const score =
      fitValue * 0.45 + proximity * 0.35 + timeSoon * 0.2;

    const tags: string[] = [];
    // Only tag "Fits your schedule" when there ARE classes that day and the event doesn't overlap
    if (scheduleFitResult === 1) tags.push("Fits your schedule");
    if (nearBuildingLabel && proximity > 0.7)
      tags.push(`Near ${nearBuildingLabel}`);

    scores[e.id] = {
      score: clamp01(score),
      scheduleFit: fitValue,
      proximity,
      timeSoon,
      tags,
      nearBuildingLabel,
    };
  }

  return scores;
}

