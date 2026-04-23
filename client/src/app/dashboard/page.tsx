"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { fetchEvents, Event } from "@/lib/utils";
import Navbar from "../../components/Navbar";

export default function DashboardPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let unsub: (() => void) | undefined;
    let cancelled = false;

    const subscribe = () => {
      unsub = onAuthStateChanged(auth, (user) => {
        if (!user) router.push("/login");
      });
    };

    // Wait for persisted session; subscribing too early can fire null and bounce to /login.
    auth
      .authStateReady()
      .then(() => {
        if (!cancelled) subscribe();
      })
      .catch(() => {
        if (!cancelled) subscribe();
      });

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [router]);

  useEffect(() => {
    fetchEvents().then(setEvents).catch(console.error);
  }, []);

  const filteredEvents = events.filter((event) => {
    const query = search.toLowerCase();
    return (
      event.Title.toLowerCase().includes(query) ||
      event.Organization?.toLowerCase().includes(query) ||
      event.Location.toLowerCase().includes(query) ||
      event.Description?.toLowerCase().includes(query) ||
      event.Category?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#f8f8f8] transition-colors duration-300 dark:bg-[#111111]">
      <Navbar search={search} setSearch={setSearch} />

      <main className="mx-auto w-full max-w-[92%] px-8 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-md border border-gray-200 bg-white p-5 transition-colors duration-300 dark:border-gray-700 dark:bg-[#1a1a1a]"
              >
                <div className="mb-5 h-40 w-full rounded-md bg-gray-100 transition-colors duration-300 dark:bg-[#2a2a2a]" />

                <h2 className="mb-2 text-center text-2xl font-medium text-black dark:text-white">
                  {event.Title}
                </h2>

                <p className="mb-1 text-center text-sm text-gray-500 dark:text-gray-400">
                  {event.Date}
                </p>

                <p className="mb-1 text-center text-sm text-gray-500 dark:text-gray-400">
                  {event.Start_time} - {event.End_time}
                </p>

                <p className="mb-1 text-center text-sm text-gray-500 dark:text-gray-400">
                  {event.Location}
                </p>

                <p className="mb-5 text-center text-sm text-gray-500 dark:text-gray-400">
                  {event.Organization}
                </p>

                <div className="flex justify-center">
                  <button className="rounded bg-gray-100 px-5 py-2 text-sm text-black transition hover:bg-gray-200 dark:bg-[#2a2a2a] dark:text-white dark:hover:bg-[#333333]">
                    Explore
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-md border border-gray-200 bg-white p-10 text-center text-gray-500 transition-colors duration-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-gray-400">
              No events found.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
