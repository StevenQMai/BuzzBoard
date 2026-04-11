"use client";

import { useEffect, useState } from "react";
import { fetchEvents, Event } from "@/lib/utils";
import EventCard from "./EventCard";

type Props = {
  search?: string;
  refreshKey?: number;
};

export default function EventGrid({ search = "", refreshKey = 0 }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .catch(() => setError(true));
  }, [refreshKey]);

  if (error) {
    return (
      <section className="px-6 pb-16 lg:px-8">
        <p className="text-center text-gray-400 py-16">
          Could not load events. Make sure the server is running.
        </p>
      </section>
    );
  }

  const filtered = events.filter((e) =>
    e.Title.toLowerCase().includes(search.toLowerCase()) ||
    e.Category?.toLowerCase().includes(search.toLowerCase()) ||
    e.Organization?.toLowerCase().includes(search.toLowerCase())
  );

  if (filtered.length === 0) {
    return (
      <section className="px-6 pb-16 lg:px-8">
        <p className="text-center text-gray-400 py-16">No events found.</p>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-8 px-6 pb-16 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
      {filtered.map((event) => (
        <EventCard key={event.id} Title={event.Title} />
      ))}
    </section>
  );
}
