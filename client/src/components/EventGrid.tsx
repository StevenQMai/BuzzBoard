"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchEvents, type Event } from "@/lib/utils";
import {
  isPastEvent,
  isStartingWithinHours,
  sortEventsByStartAsc,
} from "@/lib/eventTime";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import type { ClassBlock } from "@/lib/scheduleParser";
import {
  loadScheduleFromFirestore,
  loadScheduleFromLocalStorage,
  saveScheduleToLocalStorage,
} from "@/lib/scheduleStore";
import { scoreEventsForSchedule } from "@/lib/scheduleScoring";
import EventCard from "./EventCard";
import StartingSoonStrip from "./StartingSoonStrip";
import EventQuickViewModal from "./EventQuickViewModal";

type Props = {
  search?: string;
  refreshKey?: number;
};

function matchesSearch(e: Event, q: string): boolean {
  const s = q.toLowerCase().trim();
  if (!s) return true;
  return (
    e.Title.toLowerCase().includes(s) ||
    (e.Category?.toLowerCase().includes(s) ?? false) ||
    (e.Organization?.toLowerCase().includes(s) ?? false) ||
    (e.Location?.toLowerCase().includes(s) ?? false) ||
    (e.Description?.toLowerCase().includes(s) ?? false)
  );
}

export default function EventGrid({ search = "", refreshKey = 0 }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState(false);
  const [quickViewEvent, setQuickViewEvent] = useState<Event | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [schedule, setSchedule] = useState<ClassBlock[] | null>(null);
  const [scheduleBump, setScheduleBump] = useState(0);

  // Allow parent components (e.g., ScheduleImportButton) to trigger a resync by
  // bumping this state via a custom event (no prop threading required).
  useEffect(() => {
    const onChanged = () => setScheduleBump((n) => n + 1);
    window.addEventListener("buzzboard:scheduleChanged", onChanged);
    return () => window.removeEventListener("buzzboard:scheduleChanged", onChanged);
  }, []);

  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .catch(() => setError(true));
  }, [refreshKey]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    // Instant local cache
    const cached =
      typeof window !== "undefined" ? loadScheduleFromLocalStorage() : null;
    setSchedule(cached?.length ? cached : null);

    // Sync from Firestore (if signed in)
    if (!user) return;
    let alive = true;
    loadScheduleFromFirestore(user.uid)
      .then((remote) => {
        if (!alive) return;
        if (remote?.length) {
          setSchedule(remote);
          saveScheduleToLocalStorage(remote);
        } else if (!cached?.length) {
          setSchedule(null);
        }
      })
      .catch(() => {
        // ignore; local cache still applies
      });
    return () => {
      alive = false;
    };
  }, [user, scheduleBump]);

  const { soon, rest, scheduleScores } = useMemo(() => {
    const filtered = events.filter((e) => matchesSearch(e, search));
    const upcoming = filtered.filter((e) => !isPastEvent(e));
    const sortedChrono = sortEventsByStartAsc(upcoming);

    const scores = schedule?.length
      ? scoreEventsForSchedule(sortedChrono, schedule)
      : null;

    const sorted = scores
      ? [...sortedChrono].sort((a, b) => {
          const sa = scores[a.id]?.score ?? 0;
          const sb = scores[b.id]?.score ?? 0;
          if (sb !== sa) return sb - sa;
          // stable tie-breaker: earlier start first
          return (
            (sortedChrono.findIndex((e) => e.id === a.id) ?? 0) -
            (sortedChrono.findIndex((e) => e.id === b.id) ?? 0)
          );
        })
      : sortedChrono;

    const soonList = sorted.filter((e) => isStartingWithinHours(e, 48));
    const soonIds = new Set(soonList.map((e) => e.id));
    const restList = sorted.filter((e) => !soonIds.has(e.id));
    return { soon: soonList, rest: restList, scheduleScores: scores };
  }, [events, search, schedule]);

  if (error) {
    return (
      <section className="px-6 pb-16 lg:px-8">
        <p className="py-16 text-center text-zinc-400">
          Could not load events. Make sure the server is running.
        </p>
      </section>
    );
  }

  const hasAnyUpcoming = soon.length > 0 || rest.length > 0;
  const hasSearchNoHits =
    search.trim() && !hasAnyUpcoming && events.length > 0;

  if (!hasAnyUpcoming && !hasSearchNoHits) {
    return (
      <section className="mx-auto max-w-2xl px-6 pb-16 text-center lg:px-8">
        <p className="mb-2 text-lg font-medium text-zinc-800 dark:text-zinc-200">
          No upcoming events yet
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Be the first to post a study session, coffee meetup, or hangout on
          campus.
        </p>
      </section>
    );
  }

  if (hasSearchNoHits) {
    return (
      <section className="px-6 pb-16 lg:px-8">
        <p className="py-16 text-center text-zinc-400">
          No events match &ldquo;{search}&rdquo;. Try another search.
        </p>
      </section>
    );
  }

  return (
    <>
      <StartingSoonStrip events={soon} />
      <section className="px-4 pb-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {rest.length > 0 && (
            <>
              <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {soon.length > 0 ? "More upcoming" : "Upcoming"}
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    scheduleTags={scheduleScores?.[event.id]?.tags}
                    onQuickView={setQuickViewEvent}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <EventQuickViewModal
        open={quickViewEvent !== null}
        event={quickViewEvent}
        onClose={() => setQuickViewEvent(null)}
      />
    </>
  );
}
