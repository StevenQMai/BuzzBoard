"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";

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
  const [userEmail, setUserEmail] = useState("");
  const [filter, setFilter] = useState("All");
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        setUserEmail(user.email ?? "");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    async function fetchEvents() {
      const snapshot = await getDocs(collection(db, "events"));
      const parsed: Event[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      setEvents(parsed);
    }
    fetchEvents();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const filtered = filter === "All"
    ? events
    : events.filter((e) => e.Category === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">BuzzBoard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{userEmail}</span>
          <button
            onClick={handleSignOut}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-1">Upcoming Events</h2>
        <p className="text-gray-500 text-sm mb-6">Stay up to date with everything happening at school.</p>

        <div className="flex gap-2 mb-6">
          {["All", "School Event", "Club Meeting"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                filter === tab
                  ? "bg-blue-600 text-white"
                  : "bg-white border text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-sm p-5 flex gap-4 items-start">
              <div className="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 bg-blue-500" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{event.Title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {event.Category}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {event.Date} · {event.Start_time} - {event.End_time} · {event.Location}
                </p>
                <p className="text-xs text-gray-400 mt-1">{event.Organization}</p>
                <p className="text-xs text-gray-400 mt-1">{event.Description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}