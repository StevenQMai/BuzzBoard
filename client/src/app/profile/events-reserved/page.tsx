"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { fetchEventById, type Event } from "@/lib/utils";
import { useUserRsvps } from "@/hooks/useRsvp";
import EventCard from "@/components/EventCard";
import EventQuickViewModal from "@/components/EventQuickViewModal";

export default function EventsReservedPage() {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [fetching, setFetching] = useState(false);
  const [quickViewEvent, setQuickViewEvent] = useState<Event | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const { rsvps, loading: rsvpLoading } = useUserRsvps(user?.uid ?? null);

  useEffect(() => {
    if (rsvpLoading || rsvps.length === 0) {
      setEvents([]);
      return;
    }

    let cancelled = false;
    setFetching(true);

    Promise.all(rsvps.map((r) => fetchEventById(r.eventId).catch(() => null)))
      .then((results) => {
        if (cancelled) return;
        setEvents(results.filter(Boolean) as Event[]);
      })
      .finally(() => {
        if (!cancelled) setFetching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [rsvps, rsvpLoading]);

  const loading = rsvpLoading || fetching;

  return (
    <>
      <h2 className="mb-[clamp(1rem,3vw,2rem)] text-[clamp(1.25rem,3vw,1.75rem)] font-semibold text-zinc-900 dark:text-white">
        Events Reserved
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
        </div>
      ) : events.length === 0 ? (
        <div className="glass-surface flex flex-col items-center justify-center rounded-[clamp(16px,3vw,24px)] border-2 border-gray-500 px-6 py-20 text-center dark:border-gray-500">
          <div className="mb-4 text-5xl">🎟️</div>
          <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
            No RSVPs yet
          </h3>
          <p className="max-w-md text-sm text-zinc-500 dark:text-zinc-400">
            Once you RSVP to events, they&apos;ll show up here so you can keep track of
            everything you&apos;ve signed up for.
          </p>
        </div>
      ) : (
        <div
          className="grid gap-[clamp(1rem,2vw,1.5rem)]"
          style={{
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
          }}
        >
          {events.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              onQuickView={setQuickViewEvent}
            />
          ))}
        </div>
      )}

      {quickViewEvent && (
        <EventQuickViewModal
          open={true}
          event={quickViewEvent}
          onClose={() => setQuickViewEvent(null)}
        />
      )}
    </>
  );
}
