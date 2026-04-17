import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  getDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type RsvpDoc = {
  userId: string;
  eventId: string;
  displayName: string;
  photoURL: string | null;
  rsvpAt: unknown;
};

function rsvpDocId(userId: string, eventId: string): string {
  return `${userId}_${eventId}`;
}

export async function toggleRsvp(
  userId: string,
  eventId: string,
  profile: { displayName: string; photoURL: string | null },
): Promise<boolean> {
  const ref = doc(db, "rsvps", rsvpDocId(userId, eventId));
  const snap = await getDoc(ref);

  if (snap.exists()) {
    await deleteDoc(ref);
    return false;
  }

  await setDoc(ref, {
    userId,
    eventId,
    displayName: profile.displayName,
    photoURL: profile.photoURL,
    rsvpAt: serverTimestamp(),
  });
  return true;
}

export function subscribeEventRsvps(
  eventId: string,
  callback: (rsvps: RsvpDoc[]) => void,
): Unsubscribe {
  const q = query(collection(db, "rsvps"), where("eventId", "==", eventId));
  return onSnapshot(q, (snap) => {
    const rsvps: RsvpDoc[] = [];
    snap.forEach((d) => rsvps.push(d.data() as RsvpDoc));
    callback(rsvps);
  });
}

export function subscribeUserRsvps(
  userId: string,
  callback: (rsvps: RsvpDoc[]) => void,
): Unsubscribe {
  const q = query(collection(db, "rsvps"), where("userId", "==", userId));
  return onSnapshot(q, (snap) => {
    const rsvps: RsvpDoc[] = [];
    snap.forEach((d) => rsvps.push(d.data() as RsvpDoc));
    callback(rsvps);
  });
}
