"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, addDoc } from "firebase/firestore";

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
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    Title: "",
    Category: "",
    Date: "",
    Start_time: "",
    End_time: "",
    Location: "",
    Organization: "",
    Description: "",
  });
  const [adding, setAdding] = useState(false);
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

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await addDoc(collection(db, "events"), {
        ...form,
        Approved: false,
        Created_at: new Date().toISOString(),
      });
      setShowModal(false);
      setForm({
        Title: "",
        Category: "",
        Date: "",
        Start_time: "",
        End_time: "",
        Location: "",
        Organization: "",
        Description: "",
      });
      // Refresh events
      const snapshot = await getDocs(collection(db, "events"));
      const parsed: Event[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      setEvents(parsed);
    } catch (err) {
      alert("Failed to add event.");
    }
    setAdding(false);
  };

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
        <button
          className="mb-6 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          onClick={() => setShowModal(true)}
        >
          Add Event
        </button>

        {showModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-50">
            <form
              className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md"
              onSubmit={handleAddEvent}
            >
              <h3 className="text-xl font-bold mb-4">Add New Event</h3>
              <div className="space-y-3">
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Title"
                  value={form.Title}
                  onChange={e => setForm(f => ({ ...f, Title: e.target.value }))}
                  required
                />
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Category"
                  value={form.Category}
                  onChange={e => setForm(f => ({ ...f, Category: e.target.value }))}
                  required
                />
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2"
                  value={form.Date}
                  onChange={e => setForm(f => ({ ...f, Date: e.target.value }))}
                  required
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Start Time</label>
                    <input
                      type="time"
                      className="w-full border rounded px-3 py-2"
                      value={form.Start_time}
                      onChange={e => setForm(f => ({ ...f, Start_time: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">End Time</label>
                    <input
                      type="time"
                      className="w-full border rounded px-3 py-2"
                      value={form.End_time}
                      onChange={e => setForm(f => ({ ...f, End_time: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={form.Location}
                  onChange={e => setForm(f => ({ ...f, Location: e.target.value }))}
                  required
                >
                  <option value="">Select location</option>
                  <option value="Klaus 243">Klaus 243</option>
                  <option value="Howey 204">Howey 204</option>
                  <option value="Student Center Cypress Theater">Student Center Cypress Theater</option>
                  <option value="Aiden's Bed">Aiden's Bed</option>
                  {/* Add more default locations here */}
                </select>
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Organization"
                  value={form.Organization}
                  onChange={e => setForm(f => ({ ...f, Organization: e.target.value }))}
                  required
                />
                <textarea
                  className="w-full border rounded px-3 py-2"
                  placeholder="Description"
                  value={form.Description}
                  onChange={e => setForm(f => ({ ...f, Description: e.target.value }))}
                  required
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition"
                  disabled={adding}
                >
                  {adding ? "Adding..." : "Add Event"}
                </button>
                <button
                  type="button"
                  className="bg-gray-200 px-4 py-2 rounded font-medium hover:bg-gray-300 transition"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
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