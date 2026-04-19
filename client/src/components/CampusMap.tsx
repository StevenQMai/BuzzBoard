"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Event } from "@/lib/utils";
import { CAMPUS_CENTER } from "@/lib/campusBuildings";
import { groupEventsByBuilding, type BuildingGroup } from "@/lib/eventGrouping";
import { formatEventDateHeading, formatTimeRange } from "@/lib/eventTime";
import type { FriendPresence } from "@/lib/presenceStore";
import { statusDotStyle } from "@/lib/presenceStore";

type Props = {
  events: Event[];
  variant: "full" | "mini";
  onEventQuickView?: (event: Event) => void;
  friends?: FriendPresence[];
  showFriends?: boolean;
};

const MINI_ZOOM = 15;
const FULL_ZOOM = 16;
const MAX_POPUP_EVENTS = 3;

// --- Popup HTML builders ---

function buildEventPopupHTML(group: BuildingGroup): string {
  const eyeSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>`;

  let html = `<div class="bb-popup-root">`;
  html += `<div class="bb-popup-header">${group.label}</div>`;

  const visible = group.events.slice(0, MAX_POPUP_EVENTS);
  for (const ev of visible) {
    const cat = ev.Category
      ? `<span class="bb-popup-cat">${ev.Category}</span>`
      : "";
    html += `
      <div class="bb-popup-event">
        <a class="bb-popup-title" href="/events/${ev.id}">${ev.Title}</a>
        <span class="bb-popup-meta">${formatEventDateHeading(ev)} · ${formatTimeRange(ev)}</span>
        ${cat}
        <button class="bb-popup-eye" data-event-id="${ev.id}" title="Quick view">${eyeSVG}</button>
      </div>`;
  }

  if (group.events.length > MAX_POPUP_EVENTS) {
    const extra = group.events.length - MAX_POPUP_EVENTS;
    html += `<div class="bb-popup-overflow">${extra} more event${extra > 1 ? "s" : ""} here</div>`;
  }

  html += `</div>`;
  return html;
}

function buildFriendPopupHTML(friend: FriendPresence): string {
  const building = friend.presence?.buildingLabel || "Unknown location";
  const isOnline = friend.presence?.isOnline ?? false;
  return `
    <div class="bb-popup-root">
      <div class="bb-popup-header">${friend.displayName}</div>
      <div class="bb-popup-event">
        <span class="bb-popup-meta">${isOnline ? "Online" : "Offline"} · ${building}</span>
      </div>
    </div>`;
}

// --- Icon builders ---

function createGoldIcon(L: typeof import("leaflet")) {
  return L.divIcon({
    className: "bb-marker",
    html: `<div class="bb-marker-dot"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function createFriendIcon(L: typeof import("leaflet"), friend: FriendPresence) {
  const dotColor = statusDotStyle(friend.presence ?? null);
  const inner = friend.photoURL
    ? `<img src="${friend.photoURL}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
    : `<span style="font-size:14px;font-weight:700;color:#92400e;">${(friend.displayName || "U").charAt(0).toUpperCase()}</span>`;
  const html = `
    <div style="position:relative;width:36px;height:36px;border-radius:50%;border:3px solid #f59e0b;background:#fef3c7;display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
      ${inner}
      <span style="position:absolute;bottom:0;right:0;width:10px;height:10px;border-radius:50%;background:${dotColor};border:2px solid white;"></span>
    </div>`;
  return L.divIcon({
    className: "bb-marker",
    html,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

// --- Component ---

export default function CampusMap({
  events,
  variant,
  onEventQuickView,
  friends = [],
  showFriends = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const eventLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const friendLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const onQuickViewRef = useRef(onEventQuickView);
  onQuickViewRef.current = onEventQuickView;

  const groups = useMemo(() => groupEventsByBuilding(events), [events]);

  // ── Map initialisation ──
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !containerRef.current || mapRef.current) return;

      const isMini = variant === "mini";

      const map = L.map(containerRef.current, {
        center: [CAMPUS_CENTER.lat, CAMPUS_CENTER.lng],
        zoom: isMini ? MINI_ZOOM : FULL_ZOOM,
        zoomControl: !isMini,
        attributionControl: false,
        dragging: !isMini,
        scrollWheelZoom: !isMini,
        doubleClickZoom: !isMini,
        touchZoom: !isMini,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      eventLayerRef.current = L.layerGroup().addTo(map);
      friendLayerRef.current = L.layerGroup().addTo(map);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      eventLayerRef.current = null;
      friendLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant]);

  // ── Event markers ──
  useEffect(() => {
    const layer = eventLayerRef.current;
    if (!layer) return;

    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !eventLayerRef.current) return;

      eventLayerRef.current.clearLayers();
      const icon = createGoldIcon(L);

      for (const group of groups) {
        const popup = L.popup({ className: "bb-glass-popup", maxWidth: 340 }).setContent(
          buildEventPopupHTML(group),
        );
        const marker = L.marker([group.coords.lat, group.coords.lng], { icon }).bindPopup(popup);

        marker.on("popupopen", () => {
          const pane = marker.getPopup()?.getElement();
          pane?.querySelectorAll<HTMLButtonElement>(".bb-popup-eye").forEach((btn) => {
            const id = btn.dataset.eventId;
            const ev = group.events.find((e) => String(e.id) === id);
            if (ev) {
              btn.addEventListener("click", (e) => {
                e.stopPropagation();
                onQuickViewRef.current?.(ev);
              }, { once: true });
            }
          });
        });

        eventLayerRef.current.addLayer(marker);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [groups]);

  // ── Friend markers ──
  useEffect(() => {
    const layer = friendLayerRef.current;
    if (!layer) return;

    layer.clearLayers();
    if (!showFriends) return;

    const onlineFriends = friends.filter(
      (f) => f.presence?.isOnline && f.presence.lat && f.presence.lng,
    );
    if (onlineFriends.length === 0) return;

    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !friendLayerRef.current) return;

      for (const friend of onlineFriends) {
        if (!friend.presence) continue;
        const icon = createFriendIcon(L, friend);
        const popup = L.popup({ className: "bb-glass-popup", maxWidth: 260 }).setContent(
          buildFriendPopupHTML(friend),
        );
        const marker = L.marker([friend.presence.lat, friend.presence.lng], { icon }).bindPopup(popup);
        friendLayerRef.current.addLayer(marker);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [friends, showFriends]);

  const wrapperClass =
    variant === "full"
      ? "h-full w-full rounded-[clamp(16px,3vw,28px)] overflow-hidden"
      : "w-full overflow-hidden rounded-[clamp(12px,2vw,16px)] glass-surface border-2 border-gray-500 dark:border-gray-500";

  const wrapperStyle =
    variant === "mini" ? { height: "clamp(200px, 25vw, 350px)" } : undefined;

  return <div ref={containerRef} className={wrapperClass} style={wrapperStyle} />;
}
