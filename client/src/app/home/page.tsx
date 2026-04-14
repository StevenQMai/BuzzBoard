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
          <div className="rounded-[36px] border-2 border-gray-400 bg-white/70 px-6 py-12 shadow-md backdrop-blur-sm transition-colors duration-300 dark:border-gray-600 dark:bg-[#1a1a1a]/60">
            <h1 className="text-center text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
              BuzzBoard
            </h1>

            <div className="mt-10 flex justify-center">
              <LandingSearchBar value={search} onChange={setSearch} />
            </div>

            <div className="mt-10">
              <CategoriesStrip active={category} onChange={setCategory} />
            </div>

            <div id="events-feed" className="mt-10">
              <div className="rounded-[36px] border-2 border-gray-400 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-gray-600 dark:bg-[#111111]">
                <EventGrid search={effectiveSearch} refreshKey={refreshKey} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
