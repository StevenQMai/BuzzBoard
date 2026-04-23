"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar, EventGrid, ScheduleImportButton } from "@/components";
import AddEventButton from "@/components/AddEventButton";
import LandingSearchBar from "@/components/LandingSearchBar";
import FilmStripCategories from "@/components/FilmStripCategories";
import MiniMapPreview from "@/components/MiniMapPreview";
import FriendsOnlineStrip from "@/components/FriendsOnlineStrip";
import { type FilterState, EMPTY_FILTER } from "@/components/FilterDropdown";

function HomeQuerySync({ onQuery }: { onQuery: (q: string) => void }) {
  const params = useSearchParams();
  const q = (params.get("q") ?? "").trim();

  useEffect(() => {
    if (!q) return;
    onQuery(q);

    const el = document.getElementById("events-feed");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [onQuery, q]);

  return null;
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [category, setCategory] = useState("All");
  const [eventFilter, setEventFilter] = useState<FilterState>(EMPTY_FILTER);

  const effectiveSearch = category === "All" ? search : `${search} ${category}`.trim();
  // Merge CategoriesStrip category into filter (dropdown category takes precedence)
  const effectiveFilter: FilterState = {
    ...eventFilter,
    category: eventFilter.category || (category !== "All" ? category : ""),
  };

  return (
    <main className="min-h-screen bg-[#fefcf3] transition-colors duration-300 dark:bg-[#111111]">
      <Suspense fallback={null}>
        <HomeQuerySync onQuery={setSearch} />
      </Suspense>
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
            <h1 className="font-logo text-center text-amber-600 dark:text-amber-400" style={{ fontSize: "clamp(2.25rem, 6vw, 3.75rem)" }}>
              BuzzBoard
            </h1>

            <div className="mt-[clamp(1.5rem,4vw,2.5rem)] flex justify-center">
              <LandingSearchBar
                  value={search}
                  onChange={setSearch}
                  showFilters
                  filterValue={eventFilter}
                  onFilterChange={setEventFilter}
                />
            </div>

            <div className="mt-[clamp(1.5rem,4vw,2.5rem)] -mx-[clamp(1rem,3vw,1.5rem)] overflow-hidden rounded-2xl">
              <FilmStripCategories active={category} onSelect={setCategory} />
            </div>

            <div id="events-feed" className="mt-[clamp(1.5rem,4vw,2.5rem)]">
              <div className="glass-surface rounded-[clamp(20px,4vw,36px)] border-2 border-gray-500 p-[clamp(1rem,3vw,1.5rem)] transition-colors duration-300 dark:border-gray-500">
                <FriendsOnlineStrip />
                <div className="mb-[clamp(1.5rem,3vw,2.5rem)]">
                  <MiniMapPreview />
                </div>
                <EventGrid search={effectiveSearch} refreshKey={refreshKey} filter={effectiveFilter} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
