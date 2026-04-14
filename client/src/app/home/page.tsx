"use client";

import { useState } from "react";
import { Navbar, EventGrid } from "@/components";
import AddEventButton from "@/components/AddEventButton";
import LandingSearchBar from "@/components/LandingSearchBar";
import CategoriesStrip from "@/components/CategoriesStrip";

export default function Home() {
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [category, setCategory] = useState("All");

  const effectiveSearch = category === "All" ? search : `${search} ${category}`.trim();

  return (
    <main className="min-h-screen bg-[#fafafa] transition-colors duration-300 dark:bg-[#111111]">
      <Navbar showSearch={false} />
      <AddEventButton onEventAddedAction={() => setRefreshKey((k) => k + 1)} />

      <section className="px-4 pt-10">
        <div className="mx-auto max-w-7xl">
          <div className="glass-surface rounded-[36px] border-2 border-gray-500 px-6 py-12 transition-colors duration-300 dark:border-gray-500">
            <h1 className="font-logo logo-stroke text-center text-5xl drop-shadow-sm sm:text-6xl">
              <span className="bg-linear-to-r from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-transparent dark:from-amber-400 dark:via-yellow-300 dark:to-amber-400">
                BuzzBoard
              </span>
            </h1>

            <div className="mt-10 flex justify-center">
              <LandingSearchBar value={search} onChange={setSearch} />
            </div>

            <div className="mt-10">
              <CategoriesStrip active={category} onChange={setCategory} />
            </div>

            <div id="events-feed" className="mt-10">
              <div className="glass-surface rounded-[36px] border-2 border-gray-500 p-6 transition-colors duration-300 dark:border-gray-500">
                <EventGrid search={effectiveSearch} refreshKey={refreshKey} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
