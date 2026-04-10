"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import Navbar2 from "../../components/Navbar2";


type Event = {
  id: string;
  Approved: boolean;
  Category: string;
  Created_at: string;
  Date: string;
  Description: string;
  End_time: string;
  Location: string;
  Organization: string;
  Start_time: string;
  Title: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    async function fetchEvents() {
      const snapshot = await getDocs(collection(db, "events"));
      const parsed: Event[] = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Event)
      );
      setEvents(parsed);
    }

    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const query = search.toLowerCase();
    return (
      event.Title.toLowerCase().includes(query) ||
      event.Organization.toLowerCase().includes(query) ||
      event.Location.toLowerCase().includes(query) ||
      event.Description.toLowerCase().includes(query) ||
      event.Category.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <Navbar2 search={search} setSearch={setSearch} />

      <main className="mx-auto w-full max-w-7xl px-8 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-md border border-gray-200 bg-white p-5"
              >
                <div className="mb-5 h-40 w-full rounded-md bg-gray-100" />

                <h2 className="mb-2 text-center text-2xl font-medium text-black">
                  {event.Title}
                </h2>

                <p className="mb-1 text-center text-sm text-gray-500">
                  {event.Date}
                </p>

                <p className="mb-1 text-center text-sm text-gray-500">
                  {event.Start_time} - {event.End_time}
                </p>

                <p className="mb-1 text-center text-sm text-gray-500">
                  {event.Location}
                </p>

                <p className="mb-5 text-center text-sm text-gray-500">
                  {event.Organization}
                </p>

                <div className="flex justify-center">
                  <button className="rounded bg-gray-100 px-5 py-2 text-sm text-black transition hover:bg-gray-200">
                    Explore
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-md border border-gray-200 bg-white p-10 text-center text-gray-500">
              No events found.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}