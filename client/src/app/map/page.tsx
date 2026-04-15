"use client";

import { useEffect, useState } from "react";
import { Navbar, EventQuickViewModal } from "@/components";
import CampusMap from "@/components/CampusMap";
import { fetchEvents, type Event } from "@/lib/utils";
import { isPastEvent } from "@/lib/eventTime";

export default function MapPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [quickViewEvent, setQuickViewEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents()
      .then((all) => setEvents(all.filter((e) => !isPastEvent(e))))
      .catch(() => {});
  }, []);

  return (
    <main className="flex h-screen flex-col bg-[#fefcf3] transition-colors duration-300 dark:bg-[#111111]">
      <Navbar showSearch={false} />

      <div className="flex min-h-0 flex-1 flex-col px-[clamp(0.75rem,2vw,1rem)] pb-[clamp(0.75rem,2vw,1rem)]">
        <div className="mx-auto w-full max-w-[92%] flex-1">
          <div className="glass-surface h-full overflow-hidden rounded-[clamp(16px,3vw,28px)] border-2 border-gray-500 dark:border-gray-500">
            <CampusMap
              events={events}
              variant="full"
              onEventQuickView={setQuickViewEvent}
            />
          </div>
        </div>
      </div>

      <EventQuickViewModal
        open={quickViewEvent !== null}
        event={quickViewEvent}
        onClose={() => setQuickViewEvent(null)}
      />
    </main>
  );
}
