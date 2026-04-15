"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  requestGeolocation,
  snapToBuilding,
  updatePresence,
  clearPresence,
} from "@/lib/presenceStore";
import { GT_BUILDINGS } from "@/lib/campusBuildings";

const POLL_INTERVAL_MS = 5 * 60 * 1000;

export type UsePresenceReturn = {
  currentBuilding: string | null;
  currentBuildingLabel: string;
  setManualBuilding: (key: string) => void;
  geoError: string | null;
};

export function usePresence(uid: string | null): UsePresenceReturn {
  const [currentBuilding, setCurrentBuilding] = useState<string | null>(null);
  const [currentBuildingLabel, setCurrentBuildingLabel] = useState("");
  const [geoError, setGeoError] = useState<string | null>(null);
  const manualRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const detectAndUpdate = useCallback(async () => {
    if (!uid || manualRef.current) return;
    try {
      const pos = await requestGeolocation();
      const result = snapToBuilding(pos.coords.latitude, pos.coords.longitude);
      if (result) {
        setCurrentBuilding(result.key);
        setCurrentBuildingLabel(result.label);
        await updatePresence(uid, result.key, result.label, result.coords.lat, result.coords.lng);
      } else {
        setCurrentBuilding(null);
        setCurrentBuildingLabel("Off campus");
        await updatePresence(uid, null, "Off campus", pos.coords.latitude, pos.coords.longitude);
      }
      setGeoError(null);
    } catch {
      setGeoError("Location unavailable");
    }
  }, [uid]);

  const setManualBuilding = useCallback(
    (key: string) => {
      if (!uid) return;
      manualRef.current = true;
      const coords = GT_BUILDINGS[key];
      if (!coords) return;

      const label = key
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      setCurrentBuilding(key);
      setCurrentBuildingLabel(label);
      updatePresence(uid, key, label, coords.lat, coords.lng);
    },
    [uid],
  );

  useEffect(() => {
    if (!uid) return;

    detectAndUpdate();
    intervalRef.current = setInterval(detectAndUpdate, POLL_INTERVAL_MS);

    const handleFocus = () => {
      if (uid) updatePresence(uid, currentBuilding, currentBuildingLabel, 0, 0).catch(() => {});
    };

    const handleBlur = () => {
      clearPresence(uid).catch(() => {});
    };

    const handleBeforeUnload = () => {
      clearPresence(uid).catch(() => {});
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearPresence(uid).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  return { currentBuilding, currentBuildingLabel, setManualBuilding, geoError };
}
