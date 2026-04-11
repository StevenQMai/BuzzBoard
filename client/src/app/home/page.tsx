"use client";

import { useState } from "react";
import { Navbar, Hero, EventGrid } from "@/components";
import AddEventButton from "@/components/AddEventButton";

export default function Home() {
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="min-h-screen bg-[#fafafa] transition-colors duration-300 dark:bg-[#111111]">
      <Navbar search={search} setSearch={setSearch} />
      <AddEventButton onEventAddedAction={() => setRefreshKey((k) => k + 1)} />
      <Hero />
      <div id="events-feed">
        <EventGrid search={search} refreshKey={refreshKey} />
      </div>
    </main>
  );
}
