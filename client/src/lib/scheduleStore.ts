import { deleteField, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ClassBlock } from "@/lib/scheduleParser";

const LS_KEY = "buzzboard_schedule";

export type StoredSchedule = {
  schedule: ClassBlock[];
  scheduleUpdatedAt: string;
};

export function loadScheduleFromLocalStorage(): ClassBlock[] | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { schedule?: unknown };
    if (!parsed || !Array.isArray((parsed as any).schedule)) return null;
    return (parsed as any).schedule as ClassBlock[];
  } catch {
    return null;
  }
}

export function saveScheduleToLocalStorage(schedule: ClassBlock[]): void {
  try {
    const payload: StoredSchedule = {
      schedule,
      scheduleUpdatedAt: new Date().toISOString(),
    };
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function clearScheduleFromLocalStorage(): void {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    // ignore
  }
}

export async function loadScheduleFromFirestore(
  uid: string
): Promise<ClassBlock[] | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as Partial<StoredSchedule> | undefined;
  const schedule = data?.schedule;
  return Array.isArray(schedule) ? (schedule as ClassBlock[]) : null;
}

export async function saveScheduleToFirestore(
  uid: string,
  schedule: ClassBlock[]
): Promise<void> {
  const ref = doc(db, "users", uid);
  const payload: StoredSchedule = {
    schedule,
    scheduleUpdatedAt: new Date().toISOString(),
  };
  await setDoc(ref, payload, { merge: true });
}

export async function clearScheduleFromFirestore(uid: string): Promise<void> {
  const ref = doc(db, "users", uid);
  // If doc doesn't exist, updateDoc will throw; setDoc merge creates doc then clears fields.
  try {
    await updateDoc(ref, { schedule: deleteField(), scheduleUpdatedAt: deleteField() });
  } catch {
    await setDoc(
      ref,
      { schedule: deleteField(), scheduleUpdatedAt: deleteField() },
      { merge: true }
    );
  }
}

