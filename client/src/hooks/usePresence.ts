"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  requestGeolocation,
  snapToBuilding,
  updatePresence,
  clearPresence,
  setUserStatus,
  type UserStatus,
} from "@/lib/presenceStore";
import { GT_BUILDINGS } from "@/lib/campusBuildings";

const POLL_INTERVAL_MS = 5 * 60 * 1000;

export type UsePresenceReturn = {
  currentBuilding: string | null;
  currentBuildingLabel: string;
  userStatus: UserStatus;
  setManualBuilding: (key: string) => void;
  setStatus: (status: UserStatus) => Promise<void>;
  geoError: string | null;
};

export function usePresence(uid: string | null): UsePresenceReturn {
  const [currentBuilding, setCurrentBuilding] = useState<string | null>(null);
  const [currentBuildingLabel, setCurrentBuildingLabel] = useState("");
  const [userStatus, setUserStatusState] = useState<UserStatus>("online");
  const [geoError, setGeoError] = useState<string | null>(null);
  const manualRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const buildingKeyRef = useRef<string | null>(null);
  const buildingLabelRef = useRef<string>("");
  const statusRef = useRef<UserStatus>("online");

  // Load persisted status from Firestore once on mount
  useEffect(() => {
    if (!uid) return;
    getDoc(doc(db, "users", uid)).then((snap) => {
      if (snap.exists()) {
        const presence = snap.data()?.presence as { status?: UserStatus } | undefined;
        if (presence?.status && presence.status !== "invisible") {
          setUserStatusState(presence.status);
          statusRef.current = presence.status;
        }
      }
    }).catch(() => {});
  }, [uid]);

  const detectAndUpdate = useCallback(async () => {
    if (!uid || manualRef.current || statusRef.current === "invisible") return;
    try {
      const pos = await requestGeolocation();
      const result = snapToBuilding(pos.coords.latitude, pos.coords.longitude);
      if (result) {
        setCurrentBuilding(result.key);
        setCurrentBuildingLabel(result.label);
        buildingKeyRef.current = result.key;
        buildingLabelRef.current = result.label;
        await updatePresence(uid, result.key, result.label, result.coords.lat, result.coords.lng, statusRef.current);
      } else {
        setCurrentBuilding(null);
        setCurrentBuildingLabel("Off campus");
        buildingKeyRef.current = null;
        buildingLabelRef.current = "Off campus";
        await updatePresence(uid, null, "Off campus", pos.coords.latitude, pos.coords.longitude, statusRef.current);
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
      buildingKeyRef.current = key;
      buildingLabelRef.current = label;
      updatePresence(uid, key, label, coords.lat, coords.lng, statusRef.current);
    },
    [uid],
  );

  const setStatus = useCallback(
    async (status: UserStatus) => {
      if (!uid) return;
      setUserStatusState(status);
      statusRef.current = status;
      if (status === "invisible") {
        await clearPresence(uid);
        await setUserStatus(uid, status);
      } else {
        await setUserStatus(uid, status);
        // Re-broadcast presence with new status
        if (buildingKeyRef.current !== null || buildingLabelRef.current) {
          await updatePresence(uid, buildingKeyRef.current, buildingLabelRef.current || "Off campus", 0, 0, status);
        } else {
          detectAndUpdate();
        }
      }
    },
    [uid, detectAndUpdate],
  );

  useEffect(() => {
    if (!uid) return;

    detectAndUpdate();
    intervalRef.current = setInterval(detectAndUpdate, POLL_INTERVAL_MS);

    const handleFocus = () => {
      if (uid && statusRef.current !== "invisible") {
        updatePresence(uid, buildingKeyRef.current, buildingLabelRef.current, 0, 0, statusRef.current).catch(() => {});
      }
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

  return { currentBuilding, currentBuildingLabel, userStatus, setManualBuilding, setStatus, geoError };
}
