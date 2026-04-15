"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Navbar, EventQuickViewModal } from "@/components";
import CampusMap from "@/components/CampusMap";
import { fetchEvents, type Event } from "@/lib/utils";
import { isPastEvent } from "@/lib/eventTime";
import { useFriends } from "@/hooks/useFriends";
import { usePresence } from "@/hooks/usePresence";

export default function MapPage() {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [quickViewEvent, setQuickViewEvent] = useState<Event | null>(null);
  const [showFriends, setShowFriends] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    fetchEvents()
      .then((all) => setEvents(all.filter((e) => !isPastEvent(e))))
      .catch(() => {});
  }, []);

  const { friends } = useFriends(user?.uid ?? null);
  usePresence(user?.uid ?? null);

  return (
    <main className="flex h-screen flex-col bg-[#fefcf3] transition-colors duration-300 dark:bg-[#111111]">
      <Navbar showSearch={false} />

      <div className="flex min-h-0 flex-1 flex-col px-[clamp(0.75rem,2vw,1rem)] pb-[clamp(0.75rem,2vw,1rem)]">
        <div className="mx-auto w-full max-w-[92%] flex-1">
          {/* Friends toggle */}
          {user && friends.length > 0 && (
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowFriends(!showFriends)}
                className={`glass-surface inline-flex items-center gap-2 rounded-xl border-2 px-3 py-1.5 text-xs font-medium transition ${
                  showFriends
                    ? "border-amber-400 text-amber-700 dark:border-amber-500 dark:text-amber-300"
                    : "border-zinc-300 text-zinc-500 dark:border-zinc-600 dark:text-zinc-400"
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                {showFriends ? "Hide Friends" : "Show Friends"}
                <span className="rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  {friends.filter((f) => f.presence?.isOnline).length}
                </span>
              </button>
            </div>
          )}

          <div className="glass-surface h-full overflow-hidden rounded-[clamp(16px,3vw,28px)] border-2 border-gray-500 dark:border-gray-500">
            <CampusMap
              events={events}
              variant="full"
              onEventQuickView={setQuickViewEvent}
              friends={friends}
              showFriends={showFriends}
            />
          </div>
        </div>
      </div>

      <EventQuickViewModal
        open={quickViewEvent !== null}
        event={quickViewEvent}
        onClose={() => setQuickViewEvent(null)}
      />
    </main>
  );
}
