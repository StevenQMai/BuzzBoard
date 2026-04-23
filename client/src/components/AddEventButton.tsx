"use client";

import { useEffect, useRef, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import CategoryChips from "./CategoryChips";
import DatePicker from "./DatePicker";
import TimePicker from "./TimePicker";

type Props = {
  onEventAddedAction?: () => void;
  rightSlot?: React.ReactNode;
};

const EMPTY_FORM = {
  Title: "",
  Date: "",
  Start_time: "",
  Location: "",
  End_time: "",
  Category: "",
  Organization: "",
  Description: "",
};

function addTwoHours(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h + 2, m, 0, 0);
  // Cap at 23:59 to avoid crossing date boundary
  if (d.getHours() < h && h >= 22) return "23:59";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function AddEventButton({ onEventAddedAction, rightSlot }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [step, setStep] = useState<1 | 2>(1);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const step2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setForm(EMPTY_FORM);
    setStep(1);
    setError(null);
  };

  const goToStep2 = () => {
    if (!form.Title || !form.Date || !form.Start_time || !form.Location) {
      setError("Please fill in all fields above.");
      return;
    }
    setError(null);
    // Pre-fill end time if user hasn't set it
    if (!form.End_time && form.Start_time) {
      setForm((f) => ({ ...f, End_time: addTwoHours(f.Start_time) }));
    }
    setStep(2);
    setTimeout(() => (step2Ref.current?.querySelector("input, textarea, button") as HTMLElement | null)?.focus(), 50);
  };

  const handleSubmit = async () => {
    const u = auth.currentUser;
    if (!u) return;
    if (!form.Title || !form.Date || !form.Start_time || !form.Location) {
      setError("Please fill in event name, date, time, and location.");
      setStep(1);
      return;
    }
    setAdding(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/events`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            End_time: form.End_time || addTwoHours(form.Start_time),
            Category: form.Category || "General",
            Organization: form.Organization || u.displayName || u.email?.split("@")[0] || "Student",
            Approved: false,
            Created_at: new Date().toISOString(),
            Host_display_name: u.displayName || u.email?.split("@")[0] || "Student",
          }),
        }
      );
      if (!res.ok) throw new Error("Server error");
      closeModal();
      onEventAddedAction?.();
    } catch {
      setError("Failed to add event. Please try again.");
    }
    setAdding(false);
  };

  const inputClass =
    "glass-surface h-10 w-full rounded-xl border-2 border-gray-400 px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-amber-400/60 dark:border-gray-500 dark:text-white dark:placeholder:text-zinc-500";

  return (
    <>
      <div className="mt-[clamp(1rem,2vw,1.5rem)] mb-[clamp(0.5rem,1.5vw,1rem)] px-[clamp(1rem,3vw,2rem)]">
        <div className="mx-auto flex w-full max-w-[92%] justify-end gap-3">
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
      </div>

      {showModal && user && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="glass-surface-strong relative w-full max-w-lg rounded-[28px] border-2 border-gray-500 p-6 shadow-2xl transition-colors duration-300 dark:border-gray-500">
            {/* Close button */}
            <button
              type="button"
              onClick={closeModal}
              className="glass-surface absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-gray-500 text-zinc-800 transition hover:bg-gray-100 dark:border-gray-500 dark:text-white dark:hover:bg-[#222222]"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
            </button>

            {/* Step indicator */}
            <div className="mb-5 flex items-center gap-2 pr-12">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Step {step} of 2</span>
              <div className="flex flex-1 items-center gap-1.5">
                <div className={`h-2 w-2 rounded-full transition-colors ${step >= 1 ? "bg-amber-500" : "border border-zinc-300 dark:border-zinc-600"}`} />
                <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
                <div className={`h-2 w-2 rounded-full transition-colors ${step >= 2 ? "bg-amber-500" : "border border-zinc-300 dark:border-zinc-600"}`} />
              </div>
            </div>

            {/* Sliding step panels */}
            <div className="overflow-hidden">
              <div
                className={`flex w-[200%] motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-in-out ${
                  step === 1 ? "translate-x-0" : "-translate-x-1/2"
                }`}
              >
                {/* ── Step 1 ── */}
                <div className="w-1/2 min-w-0 pr-6">
                  <input
                    className="mb-5 w-full bg-transparent text-2xl font-semibold tracking-tight text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white dark:placeholder:text-zinc-500"
                    placeholder="Event name"
                    value={form.Title}
                    onChange={(e) => setForm((f) => ({ ...f, Title: e.target.value }))}
                    autoFocus
                  />
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <DatePicker
                        value={form.Date}
                        onChange={(v) => setForm((f) => ({ ...f, Date: v }))}
                        className="flex-1"
                        placeholder="Date"
                      />
                      <TimePicker
                        value={form.Start_time}
                        onChange={(v) => setForm((f) => ({ ...f, Start_time: v }))}
                        className="w-[130px]"
                        placeholder="Time"
                      />
                    </div>
                    <input
                      className={inputClass}
                      placeholder="Location"
                      value={form.Location}
                      onChange={(e) => setForm((f) => ({ ...f, Location: e.target.value }))}
                    />
                  </div>

                  {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={adding}
                      className="h-10 flex-1 rounded-xl bg-black px-4 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    >
                      {adding ? "Creating..." : "Create Event"}
                    </button>
                    <button
                      type="button"
                      onClick={goToStep2}
                      className="glass-surface h-10 rounded-xl border-2 border-gray-400 px-4 text-sm font-medium text-zinc-700 transition hover:bg-gray-100 dark:border-gray-500 dark:text-zinc-200 dark:hover:bg-[#222222]"
                    >
                      Add details →
                    </button>
                  </div>
                </div>

                {/* ── Step 2 ── */}
                <div className="w-1/2 min-w-0 pl-6" ref={step2Ref}>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        End time
                      </label>
                      <TimePicker
                        value={form.End_time}
                        onChange={(v) => setForm((f) => ({ ...f, End_time: v }))}
                        className="w-[150px]"
                        placeholder="End time"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Category
                      </label>
                      <CategoryChips
                        value={form.Category}
                        onChange={(v) => setForm((f) => ({ ...f, Category: v }))}
                      />
                    </div>

                    <input
                      className={inputClass}
                      placeholder="Organizer (optional)"
                      value={form.Organization}
                      onChange={(e) => setForm((f) => ({ ...f, Organization: e.target.value }))}
                    />

                    <textarea
                      className="glass-surface min-h-[80px] w-full resize-none rounded-xl border-2 border-gray-400 p-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-amber-400/60 dark:border-gray-500 dark:text-white dark:placeholder:text-zinc-500"
                      placeholder="Description (optional)"
                      rows={3}
                      value={form.Description}
                      onChange={(e) => setForm((f) => ({ ...f, Description: e.target.value }))}
                    />
                  </div>

                  {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

                  <div className="mt-5 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => { setStep(1); setError(null); }}
                      className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={adding}
                      className="ml-auto h-10 rounded-xl bg-black px-6 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    >
                      {adding ? "Creating..." : "Create Event"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
