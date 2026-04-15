"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

type Props = {
  onEventAddedAction?: () => void;
  rightSlot?: React.ReactNode;
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

export default function AddEventButton({ onEventAddedAction, rightSlot }: Props) {
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

  return (
    <>
      <div className="mx-auto mt-6 mb-4 flex w-full max-w-7xl justify-end gap-3 px-4">
        {rightSlot}
        {user && (
          <button
            onClick={() => setShowModal(true)}
            className="rounded-xl bg-black px-5 py-3 text-sm text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Add an Event
          </button>
        )}
      </div>

      {showModal && user && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="glass-surface-strong relative w-full max-w-4xl rounded-[28px] border-2 border-gray-500 p-6 shadow-2xl transition-colors duration-300 dark:border-gray-500"
          >
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="glass-surface absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-gray-500 text-zinc-800 transition hover:bg-gray-100 dark:border-gray-500 dark:text-white dark:hover:bg-[#222222]"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
            </button>

            <div className="grid gap-6 md:grid-cols-[300px_1fr]">
              {/* ---- Left column: Upload + QR + RSVP link ---- */}
              <div className="flex flex-col gap-4">
                <div className="glass-surface flex aspect-square w-full items-center justify-center rounded-2xl border-2 border-gray-500 text-sm text-zinc-500 dark:border-gray-500 dark:text-zinc-400">
                  Upload
                </div>

                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Upload QR Code here or leave blank
                </p>
                <div className="glass-surface flex h-[140px] w-[140px] items-center justify-center rounded-2xl border-2 border-gray-500 text-sm text-zinc-500 dark:border-gray-500 dark:text-zinc-400">
                  Upload
                </div>

                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Add an RSVP Link or leave blank
                </p>
                <input
                  type="url"
                  placeholder="https://..."
                  className="glass-surface h-10 w-full rounded-xl border-2 border-gray-500 px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-amber-400/60 dark:border-gray-500 dark:text-white dark:placeholder:text-zinc-500"
                />
              </div>

              {/* ---- Right column: Buttons + Title + Details + Tags ---- */}
              <div className="flex min-w-0 flex-col">
                <div className="mb-4 flex justify-end gap-3 pr-10">
                  <button
                    type="button"
                    className="glass-surface h-11 rounded-xl border-2 border-gray-500 px-5 text-sm font-medium uppercase tracking-wide text-zinc-900 transition hover:bg-gray-100 dark:border-gray-500 dark:text-white dark:hover:bg-[#222222]"
                  >
                    Add to Calendar
                  </button>
                  <button
                    type="button"
                    className="glass-surface h-11 rounded-xl border-2 border-gray-500 px-5 text-sm font-medium uppercase tracking-wide text-zinc-900 transition hover:bg-gray-100 dark:border-gray-500 dark:text-white dark:hover:bg-[#222222]"
                  >
                    RSVP
                  </button>
                </div>

                <input
                  className="mb-4 w-full text-3xl font-semibold tracking-tight text-zinc-900 placeholder:text-zinc-400 outline-none dark:text-white dark:placeholder:text-zinc-500"
                  style={{ background: "transparent" }}
                  placeholder="Title"
                  value={form.Title}
                  onChange={(e) => setForm((f) => ({ ...f, Title: e.target.value }))}
                  required
                />

                <div className="glass-surface flex-1 rounded-2xl border-2 border-gray-500 p-4 dark:border-gray-500">
                  <div className="space-y-3">
                    <input
                      className="glass-surface h-10 w-full rounded-xl border-2 border-gray-500 px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-amber-400/60 dark:border-gray-500 dark:text-white dark:placeholder:text-zinc-500"
                      placeholder="Organizer"
                      value={form.Organization}
                      onChange={(e) => setForm((f) => ({ ...f, Organization: e.target.value }))}
                      required
                    />
                    <div className="flex gap-3">
                      <input
                        type="date"
                        className="glass-surface h-10 flex-1 rounded-xl border-2 border-gray-500 px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-amber-400/60 dark:border-gray-500 dark:text-white"
                        value={form.Date}
                        onChange={(e) => setForm((f) => ({ ...f, Date: e.target.value }))}
                        required
                      />
                      <input
                        type="time"
                        className="glass-surface h-10 w-[120px] rounded-xl border-2 border-gray-500 px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-amber-400/60 dark:border-gray-500 dark:text-white"
                        value={form.Start_time}
                        onChange={(e) => setForm((f) => ({ ...f, Start_time: e.target.value }))}
                        required
                      />
                      <span className="flex items-center text-sm text-zinc-500">–</span>
                      <input
                        type="time"
                        className="glass-surface h-10 w-[120px] rounded-xl border-2 border-gray-500 px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-amber-400/60 dark:border-gray-500 dark:text-white"
                        value={form.End_time}
                        onChange={(e) => setForm((f) => ({ ...f, End_time: e.target.value }))}
                        required
                      />
                    </div>
                    <input
                      className="glass-surface h-10 w-full rounded-xl border-2 border-gray-500 px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-amber-400/60 dark:border-gray-500 dark:text-white dark:placeholder:text-zinc-500"
                      placeholder="Location"
                      value={form.Location}
                      onChange={(e) => setForm((f) => ({ ...f, Location: e.target.value }))}
                      required
                    />
                    <textarea
                      className="glass-surface min-h-[100px] w-full resize-none rounded-xl border-2 border-gray-500 p-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-amber-400/60 dark:border-gray-500 dark:text-white dark:placeholder:text-zinc-500"
                      placeholder="Description"
                      rows={4}
                      value={form.Description}
                      onChange={(e) => setForm((f) => ({ ...f, Description: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <input
                    className="glass-surface h-10 w-[140px] rounded-xl border-2 border-gray-500 px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-amber-400/60 dark:border-gray-500 dark:text-white dark:placeholder:text-zinc-500"
                    placeholder="Category / Tag"
                    value={form.Category}
                    onChange={(e) => setForm((f) => ({ ...f, Category: e.target.value }))}
                    required
                  />

                  <div className="ml-auto flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="glass-surface h-10 rounded-xl border-2 border-gray-500 px-5 text-sm font-medium text-zinc-700 transition hover:bg-gray-100 dark:border-gray-500 dark:text-zinc-200 dark:hover:bg-[#222222]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={adding}
                      className="h-10 rounded-xl bg-black px-6 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    >
                      {adding ? "Adding..." : "Add Event"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
