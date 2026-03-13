"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const MOCK_EVENTS = [
  { id: 1, type: "Club Meeting", title: "Chess Club", date: "March 14", time: "3:30 PM", location: "Room 204" },
  { id: 2, type: "School Event", title: "Spring Talent Show", date: "March 15", time: "6:00 PM", location: "Auditorium" },
  { id: 3, type: "Club Meeting", title: "Debate Team", date: "March 16", time: "4:00 PM", location: "Room 112" },
  { id: 4, type: "School Event", title: "Science Fair", date: "March 18", time: "9:00 AM", location: "Gymnasium" },
  { id: 5, type: "Club Meeting", title: "Art Club", date: "March 19", time: "3:30 PM", location: "Room 301" },
];

export default function HomePage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [filter, setFilter] = useState("All");

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

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const filtered = filter === "All"
    ? MOCK_EVENTS
    : MOCK_EVENTS.filter((e) => e.type === filter);

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
              <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                event.type === "School Event" ? "bg-blue-500" : "bg-purple-500"
              }`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{event.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    event.type === "School Event"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-purple-100 text-purple-700"
                  }`}>
                    {event.type}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {event.date} · {event.time} · {event.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}