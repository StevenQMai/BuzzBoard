"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

type Props = {
  onEventAddedAction?: () => void;
};

const EMPTY_FORM = {
  Title: "",
  Category: "",
  Date: "",
  Start_time: "",
  End_time: "",
  Location: "",
  Organization: "",
  Description: "",
};

export default function AddEventButton({ onEventAddedAction }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = auth.currentUser;
    if (!u) return;
    setAdding(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/events`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            Approved: false,
            Created_at: new Date().toISOString(),
            Host_display_name:
              u.displayName || u.email?.split("@")[0] || "Student",
          }),
        }
      );
      if (!res.ok) throw new Error("Server error");
      setShowModal(false);
      setForm(EMPTY_FORM);
      onEventAddedAction?.();
    } catch {
      alert("Failed to add event.");
    }
    setAdding(false);
  };

  if (!user) return null;

  return (
    <>
      <div className="mx-auto mt-6 mb-4 flex w-full max-w-7xl justify-end px-4">
        <button
          onClick={() => setShowModal(true)}
          className="rounded-xl bg-black px-5 py-3 text-sm text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          Add an Event
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl transition-colors duration-300 dark:bg-[#1a1a1a]"
          >
            <h3 className="mb-5 text-xl font-bold text-black dark:text-white">Add New Event</h3>
            <div className="space-y-3">
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-black dark:border-gray-600 dark:bg-[#111111] dark:text-white"
                placeholder="Title"
                value={form.Title}
                onChange={(e) => setForm((f) => ({ ...f, Title: e.target.value }))}
                required
              />
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-black dark:border-gray-600 dark:bg-[#111111] dark:text-white"
                placeholder="Category"
                value={form.Category}
                onChange={(e) => setForm((f) => ({ ...f, Category: e.target.value }))}
                required
              />
              <label className="block text-sm font-medium text-black dark:text-white">Date</label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-black dark:border-gray-600 dark:bg-[#111111] dark:text-white"
                value={form.Date}
                onChange={(e) => setForm((f) => ({ ...f, Date: e.target.value }))}
                required
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-black dark:text-white">Start Time</label>
                  <input
                    type="time"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-black dark:border-gray-600 dark:bg-[#111111] dark:text-white"
                    value={form.Start_time}
                    onChange={(e) => setForm((f) => ({ ...f, Start_time: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-black dark:text-white">End Time</label>
                  <input
                    type="time"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-black dark:border-gray-600 dark:bg-[#111111] dark:text-white"
                    value={form.End_time}
                    onChange={(e) => setForm((f) => ({ ...f, End_time: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <label className="block text-sm font-medium text-black dark:text-white">Location</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-black dark:border-gray-600 dark:bg-[#111111] dark:text-white"
                value={form.Location}
                onChange={(e) => setForm((f) => ({ ...f, Location: e.target.value }))}
                required
              >
                <option value="">Select location</option>
                <option value="Klaus 243">Klaus 243</option>
                <option value="Howey 204">Howey 204</option>
                <option value="Student Center Cypress Theater">Student Center Cypress Theater</option>
                <option value="Aiden's Bed">Aiden's Bed</option>
              </select>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-black dark:border-gray-600 dark:bg-[#111111] dark:text-white"
                placeholder="Organization"
                value={form.Organization}
                onChange={(e) => setForm((f) => ({ ...f, Organization: e.target.value }))}
                required
              />
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-black dark:border-gray-600 dark:bg-[#111111] dark:text-white"
                placeholder="Description"
                rows={3}
                value={form.Description}
                onChange={(e) => setForm((f) => ({ ...f, Description: e.target.value }))}
                required
              />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={adding}
                className="rounded-xl bg-black px-5 py-2 text-sm text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                {adding ? "Adding..." : "Add Event"}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-gray-300 px-5 py-2 text-sm text-black transition hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-[#222222]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
