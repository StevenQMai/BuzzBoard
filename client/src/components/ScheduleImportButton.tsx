"use client";

import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { parseScheduleICS, type ClassBlock } from "@/lib/scheduleParser";
import {
  clearScheduleFromFirestore,
  clearScheduleFromLocalStorage,
  loadScheduleFromFirestore,
  loadScheduleFromLocalStorage,
  saveScheduleToFirestore,
  saveScheduleToLocalStorage,
} from "@/lib/scheduleStore";

type Props = {
  onScheduleChanged?: () => void;
};

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export default function ScheduleImportButton({ onScheduleChanged }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [hasSchedule, setHasSchedule] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setError(null);

      // Instant: local cache
      const cached = typeof window !== "undefined" ? loadScheduleFromLocalStorage() : null;
      if (cached?.length) setHasSchedule(true);

      // Sync: Firestore
      if (u) {
        try {
          const remote = await loadScheduleFromFirestore(u.uid);
          if (remote?.length) {
            setHasSchedule(true);
            saveScheduleToLocalStorage(remote);
            onScheduleChanged?.();
          } else if (!cached?.length) {
            setHasSchedule(false);
          }
        } catch {
          // ignore; local cache still works
        }
      } else {
        setHasSchedule(Boolean(cached?.length));
      }
    });
    return () => unsub();
  }, [onScheduleChanged]);

  const importFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const text = await file.text();
      const schedule: ClassBlock[] = parseScheduleICS(text);
      if (!schedule.length) throw new Error("No events found in ICS.");

      saveScheduleToLocalStorage(schedule);
      setHasSchedule(true);

      if (user) {
        await saveScheduleToFirestore(user.uid, schedule);
      }

      onScheduleChanged?.();
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to import schedule.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const clearSchedule = async () => {
    setBusy(true);
    setError(null);
    try {
      clearScheduleFromLocalStorage();
      if (user) await clearScheduleFromFirestore(user.uid);
      setHasSchedule(false);
      onScheduleChanged?.();
      setOpen(false);
    } catch {
      setError("Failed to remove schedule.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative z-20">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="glass-surface inline-flex h-11 items-center gap-2 rounded-xl border-2 border-gray-500 px-4 text-sm font-medium text-zinc-900 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-500 dark:text-white dark:hover:bg-[#222222]"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <CalendarIcon className="h-5 w-5" />
        <span>{hasSchedule ? "Schedule Imported" : "Import Schedule"}</span>
      </button>

      {open && (
        <div
          className="glass-surface absolute right-0 z-50 mt-2 w-[320px] rounded-2xl border-2 border-gray-500 p-4 text-sm text-zinc-700 shadow-xl dark:border-gray-500 dark:text-zinc-200"
          role="dialog"
          aria-label="Import class schedule"
        >
          {!user && (
            <p className="mb-3 text-zinc-600 dark:text-zinc-300">
              Sign in to save your schedule across devices. You can still import
              locally for this browser.
            </p>
          )}

          <input
            ref={fileRef}
            type="file"
            accept=".ics,text/calendar"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importFile(f);
            }}
          />

          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              className="glass-surface flex-1 rounded-xl border-2 border-gray-500 px-3 py-2 text-sm font-medium text-zinc-900 transition hover:bg-gray-100 disabled:opacity-60 dark:border-gray-500 dark:text-white dark:hover:bg-[#222222]"
            >
              {busy ? "Importing…" : "Choose .ics file"}
            </button>
            <button
              type="button"
              disabled={busy || !hasSchedule}
              onClick={() => void clearSchedule()}
              className="glass-surface rounded-xl border-2 border-gray-500 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-gray-100 disabled:opacity-60 dark:border-gray-500 dark:text-zinc-200 dark:hover:bg-[#222222]"
            >
              Remove
            </button>
          </div>

          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            Export your GT-Scheduler schedule as an iCalendar (.ics) file, then
            import it here to prioritize events that fit your time and location.
          </p>

          {error && (
            <p className="mt-3 text-xs font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

