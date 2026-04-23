"use client";

import { useEffect, useRef, useState } from "react";
import FilterDropdown, { type FilterState, EMPTY_FILTER } from "./FilterDropdown";
import NavSearch from "./NavSearch";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showFilters?: boolean;
  onSubmit?: (query: string) => void;
  filterValue?: FilterState;
  onFilterChange?: (v: FilterState) => void;
};

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591L15.75 12.5v5.25a.75.75 0 0 1-.375.651l-3 1.5a.75.75 0 0 1-1.125-.651V12.5L4.659 7.409A2.25 2.25 0 0 1 4 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
    </svg>
  );
}

export default function LandingSearchBar({
  value,
  onChange,
  placeholder = "Search",
  showFilters = false,
  onSubmit,
  filterValue = EMPTY_FILTER,
  onFilterChange,
}: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filtersOpen) return;
    const handler = (e: MouseEvent) => {
      if (filterContainerRef.current && !filterContainerRef.current.contains(e.target as Node)) {
        setFiltersOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filtersOpen]);

  const hasActiveFilter =
    !!filterValue.date ||
    !!filterValue.category ||
    filterValue.time !== "any" ||
    !!filterValue.location;

  return (
    <div className="mx-auto flex w-full max-w-xl items-center gap-3">
      <div className="min-w-0 flex-1">
        <NavSearch
          value={value}
          onChange={onChange}
          onSubmit={(q) => onSubmit?.(q)}
          placeholder={placeholder}
          containerClassName="relative flex w-full min-w-0 items-center gap-3"
          inputClassName="glass-surface h-11 flex-1 rounded-xl border-2 border-gray-500 px-4 text-sm text-black outline-none transition-colors duration-300 dark:border-gray-500 dark:text-white dark:placeholder:text-gray-400"
          buttonClassName="glass-surface inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-gray-500 text-zinc-800 transition hover:bg-gray-100 dark:border-gray-500 dark:text-white dark:hover:bg-[#222222]"
        />
      </div>

      {showFilters && (
        <div ref={filterContainerRef} className="relative shrink-0">
          <button
            type="button"
            aria-expanded={filtersOpen}
            aria-label="Open filters"
            onClick={() => setFiltersOpen((prev) => !prev)}
            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 transition active:scale-95 ${
              filtersOpen
                ? "border-gray-500 bg-gray-100 text-zinc-900 dark:border-gray-600 dark:bg-[#222222] dark:text-white"
                : hasActiveFilter
                ? "border-amber-500 bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:hover:bg-amber-900/60"
                : "border-gray-400 text-zinc-800 hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-[#222222]"
            }`}
          >
            <FilterIcon className="h-5 w-5" />
          </button>

          {filtersOpen && (
            <FilterDropdown
              value={filterValue}
              onChange={(v) => onFilterChange?.(v)}
            />
          )}
        </div>
      )}
    </div>
  );
}
