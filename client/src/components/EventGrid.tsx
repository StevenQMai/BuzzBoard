"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { subscribeEventRsvps } from "@/lib/rsvpStore";
import EventCard from "./EventCard";
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
  const [rsvpCounts, setRsvpCounts] = useState<Record<string, number>>({});
  const [displayedCount, setDisplayedCount] = useState(9);
  const rsvpUnsubsRef = useRef<Record<string, () => void>>({});

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
    // Reset pagination when search changes
    setDisplayedCount(9);
  }, [search, refreshKey]);

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

  const visibleIds = useMemo(() => events.filter((e) => !isPastEvent(e)).map((e) => e.id), [events]);

  useEffect(() => {
    const prev = rsvpUnsubsRef.current;
    const needed = new Set(visibleIds);
    const current: Record<string, () => void> = {};

    for (const id of Object.keys(prev)) {
      if (!needed.has(id)) {
        prev[id]();
      }
    }

    for (const id of visibleIds) {
      if (prev[id]) {
        current[id] = prev[id];
      } else {
        current[id] = subscribeEventRsvps(id, (rsvps) => {
          setRsvpCounts((c) => ({ ...c, [id]: rsvps.length }));
        });
      }
    }

    rsvpUnsubsRef.current = current;

    return () => {
      for (const unsub of Object.values(current)) unsub();
      rsvpUnsubsRef.current = {};
    };
  }, [visibleIds]);

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
      <section className="pb-[clamp(2rem,4vw,4rem)]">
        <div className="w-full">
          {soon.length > 0 && (
            <>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Starting soon
              </h2>
              <div
                className="mb-[clamp(1.5rem,3vw,2.5rem)] grid gap-[clamp(1rem,2vw,1.5rem)]"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))" }}
              >
                {soon.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    variant="soon"
                    scheduleTags={scheduleScores?.[event.id]?.tags}
                    onQuickView={setQuickViewEvent}
                    rsvpCount={rsvpCounts[event.id]}
                  />
                ))}
              </div>
            </>
          )}

          {rest.length > 0 && (
            <>
              <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {soon.length > 0 ? "More upcoming" : "Upcoming"}
              </h2>
              <div
                className="grid gap-[clamp(1rem,2vw,1.5rem)]"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))" }}
              >
                {rest.slice(0, displayedCount).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    scheduleTags={scheduleScores?.[event.id]?.tags}
                    onQuickView={setQuickViewEvent}
                    rsvpCount={rsvpCounts[event.id]}
                  />
                ))}
              </div>
              {displayedCount < rest.length && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => setDisplayedCount((n) => n + 9)}
                    className="rounded-lg bg-amber-600 px-6 py-2 font-medium text-white transition-colors hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
                  >
                    Load More
                  </button>
                </div>
              )}
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
