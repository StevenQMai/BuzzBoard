"use client";

import { useState } from "react";
import { Navbar, EventGrid, ScheduleImportButton } from "@/components";
import AddEventButton from "@/components/AddEventButton";
import LandingSearchBar from "@/components/LandingSearchBar";
import CategoriesStrip from "@/components/CategoriesStrip";
import MiniMapPreview from "@/components/MiniMapPreview";

export default function Home() {
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [category, setCategory] = useState("All");

  const effectiveSearch = category === "All" ? search : `${search} ${category}`.trim();

  return (
    <main className="min-h-screen bg-[#fefcf3] transition-colors duration-300 dark:bg-[#111111]">
      <Navbar showSearch={false} />
      <AddEventButton
        onEventAddedAction={() => setRefreshKey((k) => k + 1)}
        rightSlot={
          <ScheduleImportButton
            onScheduleChanged={() => {
              window.dispatchEvent(new Event("buzzboard:scheduleChanged"));
            }}
          />
        }
      />

      <section className="px-[clamp(1rem,3vw,2rem)] pt-[clamp(1.5rem,3vw,2.5rem)]">
        <div className="mx-auto w-full max-w-[92%]">
          <div className="glass-surface rounded-[clamp(20px,4vw,36px)] border-2 border-gray-500 px-[clamp(1rem,3vw,1.5rem)] py-[clamp(2rem,5vw,3rem)] transition-colors duration-300 dark:border-gray-500">
            <h1 className="font-logo logo-stroke text-center drop-shadow-sm" style={{ fontSize: "clamp(2.25rem, 6vw, 3.75rem)" }}>
              <span className="bg-linear-to-r from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-transparent dark:from-amber-400 dark:via-yellow-300 dark:to-amber-400">
                BuzzBoard
              </span>
            </h1>

            <div className="mt-[clamp(1.5rem,4vw,2.5rem)] flex justify-center">
              <LandingSearchBar value={search} onChange={setSearch} />
            </div>

            <div className="mt-[clamp(1.5rem,4vw,2.5rem)]">
              <CategoriesStrip active={category} onChange={setCategory} />
            </div>

            <div id="events-feed" className="mt-[clamp(1.5rem,4vw,2.5rem)]">
              <div className="glass-surface rounded-[clamp(20px,4vw,36px)] border-2 border-gray-500 p-[clamp(1rem,3vw,1.5rem)] transition-colors duration-300 dark:border-gray-500">
                <div className="mb-[clamp(1.5rem,3vw,2.5rem)]">
                  <MiniMapPreview />
                </div>
                <EventGrid search={effectiveSearch} refreshKey={refreshKey} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
