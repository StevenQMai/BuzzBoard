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
      <main className="min-h-screen bg-[#fafafa] dark:bg-[#111111]">
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
      <main className="min-h-screen bg-[#fafafa] dark:bg-[#111111]">
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
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#111111]">
      <Navbar />
      <article className="mx-auto max-w-2xl px-6 pb-20 pt-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-8 text-sm font-medium text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Back
        </button>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {event.Category}
          </span>
          {rel && !past && (
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
              {rel}
            </span>
          )}
          {past && (
            <span className="text-xs font-medium text-zinc-400">Ended</span>
          )}
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
          {event.Title}
        </h1>

        <dl className="mt-8 space-y-4 border-y border-zinc-200 py-8 dark:border-zinc-800">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              When
            </dt>
            <dd className="mt-1 text-base text-zinc-900 dark:text-zinc-100">
              {formatEventDateHeading(event)} · {formatTimeRange(event)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Where
            </dt>
            <dd className="mt-1 text-base text-zinc-900 dark:text-zinc-100">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-zinc-300 underline-offset-4 transition hover:decoration-zinc-600 dark:decoration-zinc-600 dark:hover:decoration-zinc-300"
              >
                {event.Location}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Host
            </dt>
            <dd className="mt-1 text-base text-zinc-900 dark:text-zinc-100">
              {event.Host_display_name ||
                event.Organization ||
                "Campus community"}
            </dd>
          </div>
        </dl>

        {event.Description && (
          <section className="mt-8">
            <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Details
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
              {event.Description}
            </p>
          </section>
        )}
      </article>
    </main>
  );
}
