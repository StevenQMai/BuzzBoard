"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import UserAvatar from "@/components/UserAvatar";
import { fetchEventById, type Event } from "@/lib/utils";
import {
  formatEventDateHeading,
  formatTimeRange,
  isPastEvent,
  relativeStartsIn,
} from "@/lib/eventTime";
import { useEventRsvp } from "@/hooks/useRsvp";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isRsvpd, rsvpCount, attendees, toggle, user } = useEventRsvp(id);

  useEffect(() => {
    if (!id) return;
    fetchEventById(id)
      .then(setEvent)
      .catch(() => setError("not_found"));
  }, [id]);

  if (error === "not_found") {
    return (
      <main className="min-h-screen bg-[#fefcf3] transition-colors duration-300 dark:bg-[#111111]">
        <Navbar />
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <p className="mb-6 text-lg text-zinc-600 dark:text-zinc-300">
            This event could not be found.
          </p>
          <Link
            href="/home"
            className="font-medium text-zinc-900 underline dark:text-white"
          >
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-[#fefcf3] transition-colors duration-300 dark:bg-[#111111]">
        <Navbar />
        <div className="mx-auto w-full max-w-[92%] px-[clamp(1rem,3vw,2rem)] pb-16 pt-8">
          <div className="glass-surface-strong rounded-[28px] border-2 border-gray-500 p-6">
            <div className="h-8 w-2/3 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </main>
    );
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    event.Location
  )}`;
  const rel = relativeStartsIn(event);
  const past = isPastEvent(event);

  return (
    <main className="min-h-screen bg-[#fefcf3] transition-colors duration-300 dark:bg-[#111111]">
      <Navbar />
      <div className="mx-auto w-full max-w-[92%] px-[clamp(1rem,3vw,2rem)] pb-16 pt-8">
        {/* Card — same classes as the modal panel */}
        <div className="glass-surface-strong relative w-full rounded-[28px] border-2 border-gray-500 shadow-2xl transition-colors duration-300 dark:border-gray-500">

          {/* Back button — top-right, same position/style as modal close button */}
          <button
            type="button"
            onClick={() => router.back()}
            className="glass-surface absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-gray-500 text-zinc-800 transition hover:bg-gray-100 dark:border-gray-500 dark:text-white dark:hover:bg-[#222222]"
            aria-label="Go back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Grid — exact same as modal */}
          <div className="grid gap-6 px-6 pb-6 pt-6 md:grid-cols-[clamp(260px,28%,380px)_1fr] md:items-stretch">

            {/* Left column */}
            <div className="flex flex-col">
              <div className="glass-surface flex aspect-4/3 w-full items-center justify-center rounded-2xl border-2 border-gray-500 text-sm text-zinc-500 dark:border-gray-500 dark:text-zinc-400">
                pic
              </div>

              <div className="mt-4 flex gap-3">
                {user ? (
                  <button
                    type="button"
                    onClick={toggle}
                    className={`h-11 flex-1 cursor-pointer rounded-xl border-2 text-sm font-medium transition duration-200 active:scale-[0.98] ${
                      isRsvpd
                        ? "border-amber-500 bg-amber-500 text-white shadow-sm hover:bg-amber-600 hover:shadow-md hover:ring-2 hover:ring-amber-300/70 dark:border-amber-400 dark:bg-amber-500 dark:hover:bg-amber-600 dark:hover:ring-amber-200/50"
                        : "border-gray-300 bg-white/85 text-zinc-900 shadow-sm hover:border-amber-500/90 hover:bg-amber-50 hover:shadow-md hover:ring-2 hover:ring-amber-400/40 dark:border-gray-600 dark:bg-zinc-900/80 dark:text-white dark:hover:border-amber-500 dark:hover:bg-amber-950/35 dark:hover:ring-amber-400/30"
                    }`}
                  >
                    {isRsvpd ? `Going ✓ (${rsvpCount})` : rsvpCount > 0 ? `RSVP (${rsvpCount})` : "RSVP"}
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="flex h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border-2 border-gray-300 bg-white/85 text-sm font-medium text-zinc-900 shadow-sm transition duration-200 hover:border-amber-500/90 hover:bg-amber-50 hover:shadow-md hover:ring-2 hover:ring-amber-400/40 active:scale-[0.98] dark:border-gray-600 dark:bg-zinc-900/80 dark:text-white dark:hover:border-amber-500 dark:hover:bg-amber-950/35 dark:hover:ring-amber-400/30"
                  >
                    Sign in to RSVP
                  </Link>
                )}
                <button
                  type="button"
                  className="glass-surface h-11 flex-1 rounded-xl border-2 border-gray-500 text-sm font-medium text-zinc-900 transition hover:bg-gray-100 dark:border-gray-500 dark:text-white dark:hover:bg-[#222222]"
                >
                  Add to Calendar
                </button>
              </div>
            </div>

            {/* Right column */}
            <div className="flex min-w-0 flex-col">
              <p className="pr-12 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                {event.Title}
              </p>

              <div className="glass-surface mt-4 flex-1 rounded-2xl border-2 border-gray-500 p-4 text-sm text-zinc-700 dark:border-gray-500 dark:text-zinc-200">
                <div className="rounded-2xl border border-zinc-200 bg-white/55 p-4 dark:border-zinc-800 dark:bg-zinc-950/30">
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {formatEventDateHeading(event)} · {formatTimeRange(event)}
                  </p>
                  <p className="mt-2">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-zinc-300 underline-offset-4 transition hover:decoration-zinc-600 dark:decoration-zinc-600 dark:hover:decoration-zinc-300"
                    >
                      {event.Location}
                    </a>
                  </p>
                  <p className="mt-3 text-zinc-600 dark:text-zinc-300">
                    {event.Description || "description/time/place"}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="rounded-full border border-gray-300 bg-white/65 px-3 py-1 text-xs font-medium text-zinc-800 dark:border-gray-500 dark:bg-[#111111]/40 dark:text-zinc-200">
                      {event.Category || "categories"}
                    </span>
                    {rel && !past ? (
                      <span className="text-xs font-semibold text-amber-500">
                        {rel}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-zinc-400">
                        {past ? "Ended" : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom row: attendees display + back to home */}
              <div className="mt-4 flex gap-3">
                <div className="glass-surface flex h-11 flex-1 items-center gap-2 rounded-2xl border-2 border-gray-500 px-4 text-sm text-zinc-600 dark:border-gray-500 dark:text-zinc-300">
                  <span className="shrink-0">
                    {rsvpCount} {rsvpCount === 1 ? "going" : "going"}
                  </span>
                  {attendees.length > 0 && (
                    <div className="flex -space-x-2">
                      {attendees.slice(0, 6).map((a) => (
                        <UserAvatar
                          key={a.userId}
                          photoURL={a.photoURL}
                          name={a.displayName}
                          size="h-6 w-6"
                          className="border-2 border-white dark:border-zinc-800"
                        />
                      ))}
                      {attendees.length > 6 && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-zinc-200 text-[9px] font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-700 dark:text-zinc-300">
                          +{attendees.length - 6}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <Link
                  href="/home"
                  className="glass-surface flex h-11 flex-1 items-center justify-center rounded-2xl border-2 border-gray-500 px-4 text-center text-sm font-medium text-zinc-900 transition hover:bg-gray-100 dark:border-gray-500 dark:text-white dark:hover:bg-[#222222]"
                >
                  Back to home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
