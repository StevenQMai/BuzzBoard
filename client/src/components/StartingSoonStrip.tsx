"use client";

import type { Event } from "@/lib/utils";
import EventCard from "./EventCard";

type Props = {
  events: Event[];
  onQuickView?: (event: Event) => void;
};

export default function StartingSoonStrip({ events, onQuickView }: Props) {
  if (events.length === 0) return null;

  return (
    <section className="px-4 pb-8 lg:px-8">
      <div className="mx-auto w-full max-w-[92%]">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Starting soon
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {events.map((event) => (
            <div
              key={event.id}
              className="w-[min(100%,320px)] shrink-0 snap-start"
            >
              <EventCard event={event} variant="soon" onQuickView={onQuickView} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
