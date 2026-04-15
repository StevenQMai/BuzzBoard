import type { Event } from "@/lib/utils";
import { matchBuildingKey, GT_BUILDINGS, type LatLng } from "@/lib/campusBuildings";

export type BuildingGroup = {
  key: string;
  label: string;
  coords: LatLng;
  events: Event[];
};

function keyToLabel(key: string): string {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function groupEventsByBuilding(events: Event[]): BuildingGroup[] {
  const map = new Map<string, Event[]>();

  for (const e of events) {
    const key = matchBuildingKey(e.Location || "");
    if (!key || !GT_BUILDINGS[key]) continue;
    const list = map.get(key);
    if (list) list.push(e);
    else map.set(key, [e]);
  }

  return Array.from(map.entries()).map(([key, evts]) => ({
    key,
    label: keyToLabel(key),
    coords: GT_BUILDINGS[key],
    events: evts,
  }));
}
