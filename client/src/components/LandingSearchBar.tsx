"use client";

import { useState } from "react";
import FilterDropdown from "./FilterDropdown";
import NavSearch from "./NavSearch";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showFilters?: boolean;
  onSubmit?: (query: string) => void;
};

function ChevronDownIcon({ className }: { className?: string }) {
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function LandingSearchBar({
  value,
  onChange,
  placeholder = "Search",
  showFilters = false,
  onSubmit,
}: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false);

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
        <div className="relative shrink-0">
          <button
            type="button"
            aria-expanded={filtersOpen}
            aria-label="Open filters"
            onClick={() => setFiltersOpen((prev) => !prev)}
            className="glass-surface inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-gray-500 text-zinc-800 transition hover:bg-gray-100 dark:border-gray-500 dark:text-white dark:hover:bg-[#222222]"
          >
            <ChevronDownIcon className="h-6 w-6" />
          </button>

          {filtersOpen && <FilterDropdown />}
        </div>
      )}
    </div>
  );
}

