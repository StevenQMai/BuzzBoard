"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchEvents, type Event } from "@/lib/utils";
import { isPastEvent } from "@/lib/eventTime";
import CampusMap from "./CampusMap";

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default function MiniMapPreview() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchEvents()
      .then((all) => setEvents(all.filter((e) => !isPastEvent(e))))
      .catch(() => {});
  }, []);

  return (
    <div className="group relative px-4 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/map"
          className="absolute inset-0 z-10"
          aria-label="Open full campus map"
        />
        <div className="mb-3 flex items-center gap-2">
          <MapPinIcon className="h-5 w-5 text-amber-500" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Campus Map
          </h2>
          <span className="text-xs text-zinc-400 transition group-hover:text-amber-500 dark:text-zinc-500">
            — tap to explore →
          </span>
        </div>
        <div className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg">
          <CampusMap events={events} variant="mini" />
        </div>
      </div>
    </div>
  );
}
