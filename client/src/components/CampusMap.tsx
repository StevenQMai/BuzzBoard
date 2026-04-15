"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Event } from "@/lib/utils";
import { CAMPUS_CENTER } from "@/lib/campusBuildings";
import {
  groupEventsByBuilding,
  type BuildingGroup,
} from "@/lib/eventGrouping";
import { formatEventDateHeading, formatTimeRange } from "@/lib/eventTime";
import type { FriendPresence } from "@/lib/presenceStore";

type Props = {
  events: Event[];
  variant: "full" | "mini";
  onEventQuickView?: (event: Event) => void;
  friends?: FriendPresence[];
  showFriends?: boolean;
};

const MINI_ZOOM = 14.5;
const FULL_ZOOM = 15.5;
const MAX_POPUP_EVENTS = 3;

function buildPopupHTML(group: BuildingGroup): string {
  const header = `<div class="bb-popup-header">${group.label}</div>`;
  const shown = group.events.slice(0, MAX_POPUP_EVENTS);
  const items = shown
    .map((e) => {
      const date = formatEventDateHeading(e);
      const time = formatTimeRange(e);
      return `<div class="bb-popup-event">
        <a href="/events/${e.id}" class="bb-popup-title">${e.Title}</a>
        <span class="bb-popup-meta">${date} · ${time}</span>
        ${e.Category ? `<span class="bb-popup-cat">${e.Category}</span>` : ""}
        <button class="bb-popup-eye" data-event-id="${e.id}" title="Quick view">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
        </button>
      </div>`;
    })
    .join("");

  const overflow =
    group.events.length > MAX_POPUP_EVENTS
      ? `<div class="bb-popup-overflow">${group.events.length - MAX_POPUP_EVENTS} more event${group.events.length - MAX_POPUP_EVENTS > 1 ? "s" : ""} here</div>`
      : "";

  return `<div class="bb-popup-root">${header}${items}${overflow}</div>`;
}

type LeafletModule = typeof import("leaflet");

function createGoldIcon(L: LeafletModule) {
  return L.divIcon({
    className: "bb-marker",
    html: `<div class="bb-marker-dot"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function createFriendIcon(L: LeafletModule, friend: FriendPresence) {
  const initial = (friend.displayName || "U").charAt(0).toUpperCase();
  const inner = friend.photoURL
    ? `<img src="${friend.photoURL}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
    : `<span style="font-size:14px;font-weight:700;color:#92400e;">${initial}</span>`;

  const isOnline = friend.presence?.isOnline ?? false;
  const dot = isOnline
    ? `<span style="position:absolute;bottom:0;right:0;width:10px;height:10px;border-radius:50%;background:#10b981;border:2px solid white;"></span>`
    : "";

  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:36px;height:36px;border-radius:50%;border:3px solid #f59e0b;background:#fef3c7;display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.2);">${inner}${dot}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

function buildFriendPopupHTML(friend: FriendPresence): string {
  const building = friend.presence?.buildingLabel || "Unknown location";
  const status = friend.presence?.isOnline ? "Online" : "Offline";
  return `<div class="bb-popup-root">
    <div class="bb-popup-header">${friend.displayName}</div>
    <div class="bb-popup-event">
      <span class="bb-popup-meta">${status} · ${building}</span>
    </div>
  </div>`;
}

export default function CampusMap({ events, variant, onEventQuickView, friends = [], showFriends = true }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const eventsRef = useRef(events);
  eventsRef.current = events;
  const onQuickViewRef = useRef(onEventQuickView);
  onQuickViewRef.current = onEventQuickView;

  const groups = useMemo(() => groupEventsByBuilding(events), [events]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapInstanceRef.current) return;

    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !containerRef.current) return;

      const isMini = variant === "mini";
      const map = L.map(containerRef.current, {
        center: [CAMPUS_CENTER.lat, CAMPUS_CENTER.lng],
        zoom: isMini ? MINI_ZOOM : FULL_ZOOM,
        zoomControl: !isMini,
        scrollWheelZoom: !isMini,
        dragging: !isMini,
        doubleClickZoom: !isMini,
        touchZoom: !isMini,
        attributionControl: !isMini,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: isMini
          ? ""
          : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      setTimeout(() => map.invalidateSize(), 100);
    })();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    let L: LeafletModule | null = null;
    let layerGroup: import("leaflet").LayerGroup | null = null;

    (async () => {
      L = await import("leaflet");
      const icon = createGoldIcon(L);

      layerGroup = L.layerGroup().addTo(map);

      for (const group of groups) {
        const marker = L.marker([group.coords.lat, group.coords.lng], { icon })
          .addTo(layerGroup);

        const popup = L.popup({
          maxWidth: 320,
          minWidth: 240,
          className: "bb-glass-popup",
          closeButton: true,
        });

        popup.setContent(buildPopupHTML(group));
        marker.bindPopup(popup);

        marker.on("popupopen", () => {
          const el = popup.getElement();
          if (!el) return;
          el.querySelectorAll<HTMLButtonElement>(".bb-popup-eye").forEach(
            (btn) => {
              btn.addEventListener("click", (clickEvt) => {
                clickEvt.stopPropagation();
                const id = btn.dataset.eventId;
                const ev = eventsRef.current.find((e) => e.id === id);
                if (ev) onQuickViewRef.current?.(ev);
              });
            }
          );
        });
      }
    })();

    return () => {
      if (layerGroup) {
        layerGroup.clearLayers();
        map.removeLayer(layerGroup);
      }
    };
  }, [groups]);

  // Friend markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !showFriends) return;

    let L: LeafletModule | null = null;
    let friendLayer: import("leaflet").LayerGroup | null = null;

    const onlineFriends = friends.filter((f) => f.presence?.isOnline && f.presence.lat && f.presence.lng);

    if (onlineFriends.length === 0) return;

    (async () => {
      L = await import("leaflet");
      friendLayer = L.layerGroup().addTo(map);

      for (const friend of onlineFriends) {
        if (!friend.presence) continue;
        const icon = createFriendIcon(L!, friend);
        const marker = L!.marker([friend.presence.lat, friend.presence.lng], { icon }).addTo(friendLayer!);

        const popup = L!.popup({
          maxWidth: 240,
          minWidth: 160,
          className: "bb-glass-popup",
          closeButton: true,
        });
        popup.setContent(buildFriendPopupHTML(friend));
        marker.bindPopup(popup);
      }
    })();

    return () => {
      if (friendLayer && map) {
        friendLayer.clearLayers();
        map.removeLayer(friendLayer);
      }
    };
  }, [friends, showFriends]);

  const wrapperClass =
    variant === "full"
      ? "h-full w-full rounded-[clamp(16px,3vw,28px)] overflow-hidden"
      : "w-full overflow-hidden rounded-[clamp(12px,2vw,16px)] glass-surface border-2 border-gray-500 dark:border-gray-500";

  const wrapperStyle = variant === "mini" ? { height: "clamp(200px, 25vw, 350px)" } : undefined;

  return <div ref={containerRef} className={wrapperClass} style={wrapperStyle} />;
}
