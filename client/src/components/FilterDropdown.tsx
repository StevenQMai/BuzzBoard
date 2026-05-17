"use client";

import { useState } from "react";
import DatePicker from "./DatePicker";

export type TimeFilter = "any" | "today" | "this-week" | "this-weekend";

export type FilterState = {
  date: string;
  category: string;
  time: TimeFilter;
  location: string;
};

export const EMPTY_FILTER: FilterState = {
  date: "",
  category: "",
  time: "any",
  location: "",
};

const CATEGORIES = [
  "Social", "Sports", "Music", "Food", "Tech", "Workshop", "Career", "General",
];

const TIME_OPTIONS: { label: string; value: TimeFilter }[] = [
  { label: "Any time", value: "any" },
  { label: "Today", value: "today" },
  { label: "This week", value: "this-week" },
  { label: "This weekend", value: "this-weekend" },
];

type Tile = "date" | "category" | "time" | "location";

type Props = {
  value: FilterState;
  onChange: (v: FilterState) => void;
};

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

const TILES: { id: Tile; label: string; icon: React.ReactNode; hasValue: (f: FilterState) => boolean }[] = [
  { id: "date",     label: "Date",     icon: <CalendarIcon />, hasValue: (f) => !!f.date },
  { id: "category", label: "Category", icon: <TagIcon />,      hasValue: (f) => !!f.category },
  { id: "time",     label: "Time",     icon: <ClockIcon />,    hasValue: (f) => f.time !== "any" },
  { id: "location", label: "Location", icon: <LocationIcon />, hasValue: (f) => !!f.location },
];

export default function FilterDropdown({ value, onChange }: Props) {
  const [activeTile, setActiveTile] = useState<Tile | null>(null);

  const toggle = (tile: Tile) => setActiveTile((t) => (t === tile ? null : tile));

  const tileClass = (tile: Tile) => {
    const active = activeTile === tile || TILES.find((t) => t.id === tile)?.hasValue(value);
    return `flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-5 transition cursor-pointer select-none ${
      active
        ? "border-amber-400 bg-amber-100 text-amber-700 hover:bg-amber-200 dark:border-amber-600 dark:bg-amber-900/40 dark:text-amber-400 dark:hover:bg-amber-900/60"
        : "border-gray-300 bg-gray-100 text-zinc-500 hover:bg-gray-200 dark:border-gray-600 dark:bg-[#2a2a2a] dark:text-zinc-400 dark:hover:bg-[#333333]"
    }`;
  };

  return (
    <div className="glass-surface-strong absolute right-0 top-14 z-50 w-[320px] rounded-2xl border-2 border-gray-500 p-5 shadow-xl transition-colors duration-300 dark:border-gray-500">
      <h2 className="mb-4 text-base font-semibold text-zinc-800 dark:text-white">
        Add Filter
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {TILES.map((tile) => (
          <button
            key={tile.id}
            type="button"
            onClick={() => toggle(tile.id)}
            className={tileClass(tile.id)}
          >
            {tile.icon}
            <span className="text-sm font-medium">{tile.label}</span>
          </button>
        ))}
      </div>

      {/* Inline sub-panel */}
      {activeTile === "date" && (
        <div className="mt-4 border-t border-gray-400/40 pt-4 dark:border-gray-500/40">
          <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Filter by date
          </label>
          <DatePicker
            value={value.date}
            onChange={(v) => onChange({ ...value, date: v })}
            className="w-full"
            placeholder="Pick a date"
            skipRelative
            popupClassName="absolute top-0 left-[calc(100%+8px)]"
          />
        </div>
      )}

      {activeTile === "category" && (
        <div className="mt-4 border-t border-gray-400/40 pt-4 dark:border-gray-500/40">
          <label className="mb-2 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Filter by category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const selected = value.category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onChange({ ...value, category: selected ? "" : cat })}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    selected
                      ? "border-amber-500 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                      : "glass-surface border-gray-300 text-zinc-600 hover:border-gray-500 dark:border-gray-600 dark:text-zinc-400"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeTile === "time" && (
        <div className="mt-4 border-t border-gray-400/40 pt-4 dark:border-gray-500/40">
          <label className="mb-2 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Filter by time
          </label>
          <div className="flex flex-wrap gap-2">
            {TIME_OPTIONS.map((opt) => {
              const selected = value.time === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange({ ...value, time: opt.value })}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    selected
                      ? "border-amber-500 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                      : "glass-surface border-gray-300 text-zinc-600 hover:border-gray-500 dark:border-gray-600 dark:text-zinc-400"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeTile === "location" && (
        <div className="mt-4 border-t border-gray-400/40 pt-4 dark:border-gray-500/40">
          <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Filter by location
          </label>
          <input
            type="text"
            placeholder="e.g. Klaus, Clough..."
            value={value.location}
            onChange={(e) => onChange({ ...value, location: e.target.value })}
            className="glass-surface h-10 w-full rounded-xl border-2 border-gray-400 px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-amber-400/60 dark:border-gray-500 dark:text-white dark:placeholder:text-zinc-500"
          />
        </div>
      )}

      {/* Clear all */}
      {(value.date || value.category || value.time !== "any" || value.location) && (
        <div className="mt-4 flex justify-end border-t border-gray-100 pt-3 dark:border-gray-700">
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTER)}
            className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
