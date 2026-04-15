"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { fetchEventById, type Event } from "@/lib/utils";
import {
  formatEventDateHeading,
  formatTimeRange,
  isPastEvent,
  relativeStartsIn,
} from "@/lib/eventTime";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchEventById(id)
      .then(setEvent)
      .catch(() => setError("not_found"));
  }, [id]);

  if (error === "not_found") {
    return (
      <main className="min-h-screen bg-[#fefcf3] dark:bg-[#111111]">
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
      <main className="min-h-screen bg-[#fefcf3] dark:bg-[#111111]">
        <Navbar />
        <div className="mx-auto max-w-2xl px-6 py-20">
          <div className="h-8 w-2/3 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
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
    <main className="min-h-screen bg-[#fefcf3] dark:bg-[#111111]">
      <Navbar />
      <article className="mx-auto max-w-7xl px-4 pb-16 pt-8 lg:px-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="glass-surface mb-6 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-800 dark:border-gray-500 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Back
        </button>

        <div className="glass-surface rounded-[28px] border-2 border-gray-500 p-6 transition-colors duration-300 dark:border-gray-500">
          <div className="grid gap-8 lg:min-h-[70vh] lg:grid-cols-[360px_1fr] lg:items-stretch">
            <div className="flex flex-col gap-6">
              <div className="glass-surface flex aspect-square w-full items-center justify-center rounded-2xl border-2 border-gray-500 text-sm text-zinc-500 dark:border-gray-500 dark:text-zinc-400">
                pic
              </div>

              <div className="flex flex-col">
                <div className="glass-surface flex aspect-square w-full items-center justify-center rounded-2xl border-2 border-gray-500 text-sm text-zinc-500 dark:border-gray-500 dark:text-zinc-400">
                  QR Code
                </div>
                <p className="mt-4 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  RSVP Link:
                </p>
                <p className="mt-1 break-all text-sm text-zinc-500 dark:text-zinc-400">
                  (placeholder)
                </p>
              </div>
            </div>

            <div className="flex min-w-0 flex-col">
              <h1 className="pr-2 text-5xl font-semibold leading-tight tracking-tight text-zinc-900 wrap-break-word dark:text-white">
                {event.Title}
              </h1>

              <div className="glass-surface mt-8 flex-1 rounded-2xl border-2 border-gray-500 p-5 text-sm text-zinc-700 dark:border-gray-500 dark:text-zinc-200">
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
                <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                  {event.Description || "description/time/place"}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="glass-surface rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-zinc-800 dark:border-gray-500 dark:text-zinc-200">
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

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="glass-surface h-11 rounded-xl border-2 border-gray-500 px-5 text-sm font-medium text-zinc-900 transition hover:bg-gray-100 dark:border-gray-500 dark:text-white dark:hover:bg-[#222222]"
                >
                  Add to Calendar
                </button>
                <button
                  type="button"
                  className="glass-surface h-11 rounded-xl border-2 border-gray-500 px-5 text-sm font-medium text-zinc-900 transition hover:bg-gray-100 dark:border-gray-500 dark:text-white dark:hover:bg-[#222222]"
                >
                  RSVP
                </button>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <span className="glass-surface rounded-xl border-2 border-gray-500 px-4 py-2 text-xs font-medium text-zinc-800 dark:border-gray-500 dark:text-zinc-200">
                  {event.Category || "Ex Tag"}
                </span>
                <span className="glass-surface rounded-xl border-2 border-gray-500 px-4 py-2 text-xs font-medium text-zinc-800 dark:border-gray-500 dark:text-zinc-200">
                  Ex Tag
                </span>
                <span className="glass-surface rounded-xl border-2 border-gray-500 px-4 py-2 text-xs font-medium text-zinc-800 dark:border-gray-500 dark:text-zinc-200">
                  Ex Tag
                </span>
              </div>

              <div className="mt-auto pt-10 text-right">
                <Link
                  href="/home"
                  className="text-sm font-medium text-zinc-900 underline dark:text-white"
                >
                  Back to home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
