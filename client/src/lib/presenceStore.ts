import { doc, onSnapshot, setDoc, serverTimestamp, type Unsubscribe } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GT_BUILDINGS, haversineDistanceMeters, type LatLng } from "@/lib/campusBuildings";

export type UserStatus = "online" | "idle" | "dnd" | "invisible";

export type Presence = {
  buildingKey: string | null;
  buildingLabel: string;
  lat: number;
  lng: number;
  isOnline: boolean;
  status: UserStatus;
  lastSeen: unknown;
};

export type FriendPresence = {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  presence: Presence | null;
};

export function statusDotClass(presence: Presence | null | undefined): string {
  if (!presence?.isOnline) return "bg-zinc-400";
  switch (presence.status) {
    case "idle": return "bg-amber-400";
    case "dnd": return "bg-red-500";
    default: return "bg-emerald-500";
  }
}

export function statusDotStyle(presence: Presence | null | undefined): string {
  if (!presence?.isOnline) return "#a1a1aa";
  switch (presence.status) {
    case "idle": return "#fbbf24";
    case "dnd": return "#ef4444";
    default: return "#10b981";
  }
}

const SNAP_THRESHOLD_METERS = 200;

const BUILDING_LABELS: Record<string, string> = {};
for (const key of Object.keys(GT_BUILDINGS)) {
  BUILDING_LABELS[key] = key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function snapToBuilding(lat: number, lng: number): { key: string; label: string; coords: LatLng } | null {
  let best: { key: string; dist: number } | null = null;

  for (const [key, coords] of Object.entries(GT_BUILDINGS)) {
    const d = haversineDistanceMeters({ lat, lng }, coords);
    if (d < SNAP_THRESHOLD_METERS && (!best || d < best.dist)) {
      best = { key, dist: d };
    }
  }

  if (!best) return null;
  return {
    key: best.key,
    label: BUILDING_LABELS[best.key] || best.key,
    coords: GT_BUILDINGS[best.key],
  };
}

export function requestGeolocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  });
}

export async function updatePresence(
  uid: string,
  buildingKey: string | null,
  buildingLabel: string,
  lat: number,
  lng: number,
  status: UserStatus = "online",
): Promise<void> {
  const ref = doc(db, "users", uid);
  await setDoc(
    ref,
    {
      presence: {
        buildingKey,
        buildingLabel,
        lat,
        lng,
        isOnline: true,
        status,
        lastSeen: serverTimestamp(),
      },
    },
    { merge: true },
  );
}

export async function setUserStatus(uid: string, status: UserStatus): Promise<void> {
  const ref = doc(db, "users", uid);
  await setDoc(
    ref,
    {
      presence: {
        status,
        isOnline: status !== "invisible",
        lastSeen: serverTimestamp(),
      },
    },
    { merge: true },
  );
}

export async function clearPresence(uid: string): Promise<void> {
  const ref = doc(db, "users", uid);
  await setDoc(
    ref,
    {
      presence: {
        isOnline: false,
        lastSeen: serverTimestamp(),
      },
    },
    { merge: true },
  );
}

export function subscribePresence(
  uids: string[],
  callback: (data: Map<string, FriendPresence>) => void,
): Unsubscribe {
  if (uids.length === 0) {
    callback(new Map());
    return () => {};
  }

  const unsubs: Unsubscribe[] = [];
  const presenceMap = new Map<string, FriendPresence>();

  for (const uid of uids) {
    const unsub = onSnapshot(doc(db, "users", uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as {
          displayName?: string;
          email?: string;
          photoURL?: string;
          presence?: Partial<Presence>;
        };
        presenceMap.set(uid, {
          uid,
          displayName: data.displayName || data.email?.split("@")[0] || "User",
          email: data.email || "",
          photoURL: data.photoURL || null,
          presence: data.presence ? (data.presence as Presence) : null,
        });
      }
      callback(new Map(presenceMap));
    });
    unsubs.push(unsub);
  }

  return () => unsubs.forEach((u) => u());
}
