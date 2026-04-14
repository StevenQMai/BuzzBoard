"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchEvents, type Event } from "@/lib/utils";
import {
  isPastEvent,
  isStartingWithinHours,
  sortEventsByStartAsc,
} from "@/lib/eventTime";
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

  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .catch(() => setError(true));
  }, [refreshKey]);

  const { soon, rest } = useMemo(() => {
    const filtered = events.filter((e) => matchesSearch(e, search));
    const upcoming = filtered.filter((e) => !isPastEvent(e));
    const sorted = sortEventsByStartAsc(upcoming);
    const soonList = sorted.filter((e) => isStartingWithinHours(e, 48));
    const soonIds = new Set(soonList.map((e) => e.id));
    const restList = sorted.filter((e) => !soonIds.has(e.id));
    return { soon: soonList, rest: restList };
  }, [events, search]);

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
