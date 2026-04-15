"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { fetchEvents, type Event } from "@/lib/utils";
import EventCard from "@/components/EventCard";
import EventQuickViewModal from "@/components/EventQuickViewModal";

export default function EventsCreatedPage() {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewEvent, setQuickViewEvent] = useState<Event | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        const all = await fetchEvents();
        const name = user.displayName?.toLowerCase();
        const emailPrefix = user.email?.split("@")[0]?.toLowerCase();

        const mine = all.filter((e) => {
          const host = (e.Host_display_name || "").toLowerCase();
          if (name && host === name) return true;
          if (emailPrefix && host === emailPrefix) return true;
          return false;
        });

        if (!cancelled) setEvents(mine);
      } catch { /* ignore */ }
      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [user]);

  return (
    <>
      <h2 className="mb-[clamp(1rem,3vw,2rem)] text-[clamp(1.25rem,3vw,1.75rem)] font-semibold text-zinc-900 dark:text-white">
        Events Created
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
        </div>
      ) : events.length === 0 ? (
        <div className="glass-surface rounded-[clamp(16px,3vw,24px)] border-2 border-gray-500 px-6 py-12 text-center dark:border-gray-500">
          <p className="text-zinc-500 dark:text-zinc-400">
            You haven&apos;t created any events yet.
          </p>
        </div>
      ) : (
        <div
          className="grid gap-[clamp(1rem,2vw,1.5rem)]"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))" }}
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
          event={quickViewEvent}
          onClose={() => setQuickViewEvent(null)}
        />
      )}
    </>
  );
}
