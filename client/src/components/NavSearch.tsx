"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchEvents, type Event } from "@/lib/utils";
import { isPastEvent, sortEventsByStartAsc } from "@/lib/eventTime";

type SuggestionKind = "event" | "category" | "location" | "history";

type Suggestion = {
  id: string;
  kind: SuggestionKind;
  label: string;
  secondary?: string;
  queryValue: string;
  href?: string;
};

type Props = {
  value: string;
  onChange: (next: string) => void;
  onSubmit: (query: string) => void;
  placeholder?: string;
  containerClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
};

const HISTORY_KEY = "buzzboard_search_history";
const HISTORY_MAX = 5;

function SearchIcon({ className }: { className?: string }) {
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
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  );
}

function kindLabel(kind: SuggestionKind): string {
  if (kind === "event") return "Events";
  if (kind === "category") return "Categories";
  if (kind === "history") return "Recent Searches";
  return "Locations";
}

function KindIcon({ kind, className }: { kind: SuggestionKind; className?: string }) {
  if (kind === "event") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    );
  }
  if (kind === "category") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    );
  }
  if (kind === "history") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ItemIcon({ kind }: { kind: SuggestionKind }) {
  return (
    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-100/80 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
      <KindIcon kind={kind} className="h-3.5 w-3.5" />
    </span>
  );
}

function scoreStartsWith(haystack: string, needle: string): number {
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  if (!n) return 0;
  if (h === n) return 100;
  if (h.startsWith(n)) return 50;
  if (h.includes(n)) return 10;
  return 0;
}

const ArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-amber-500 dark:text-amber-400" aria-hidden>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const AccentBar = ({ active }: { active: boolean }) => (
  <div className={`absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-amber-500 transition-opacity duration-100 ${active ? "opacity-100" : "opacity-0"}`} />
);

export default function NavSearch({
  value,
  onChange,
  onSubmit,
  placeholder = "Search events, categories, locations",
  containerClassName,
  inputClassName,
  buttonClassName,
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Fetch all events once on mount
  useEffect(() => {
    let alive = true;
    fetchEvents()
      .then((all) => {
        if (!alive) return;
        setEvents(all);
        setLoading(false);
      })
      .catch((err) => {
        if (!alive) return;
        setLoading(false);
        setLoadError(true);
        if (process.env.NODE_ENV !== "production") {
          console.error("[NavSearch] failed to fetch events:", err);
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  // Load search history from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          setSearchHistory(
            (parsed as unknown[])
              .filter((x): x is string => typeof x === "string")
              .slice(0, HISTORY_MAX)
          );
        }
      }
    } catch {}
  }, []);

  const trimmed = value.trim();

  // Suggestions for non-empty query
  const { flat, grouped } = useMemo(() => {
    const q = trimmed.toLowerCase();
    if (!q) return { flat: [] as Suggestion[], grouped: [] as { kind: SuggestionKind; items: Suggestion[] }[] };

    const eventItems = events
      .map((e) => {
        const score =
          scoreStartsWith(e.Title ?? "", q) +
          scoreStartsWith(e.Category ?? "", q) +
          scoreStartsWith(e.Location ?? "", q) +
          scoreStartsWith(e.Organization ?? "", q);
        return { e, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ e }) => ({
        id: `event:${e.id}`,
        kind: "event" as const,
        label: e.Title,
        secondary: [e.Category, e.Location].filter(Boolean).join(" · ") || undefined,
        queryValue: e.Title,
        href: `/events/${e.id}`,
      }));

    const categories = new Set<string>();
    const locations = new Set<string>();
    for (const e of events) {
      if (e.Category) categories.add(e.Category);
      if (e.Location) locations.add(e.Location);
    }

    const categoryItems = Array.from(categories)
      .map((c) => ({ c, score: scoreStartsWith(c, q) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(({ c }) => ({
        id: `category:${c}`,
        kind: "category" as const,
        label: c,
        secondary: undefined,
        queryValue: c,
      }));

    const locationItems = Array.from(locations)
      .map((l) => ({ l, score: scoreStartsWith(l, q) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(({ l }) => ({
        id: `location:${l}`,
        kind: "location" as const,
        label: l,
        secondary: undefined,
        queryValue: l,
      }));

    const groupedLocal: { kind: SuggestionKind; items: Suggestion[] }[] = [];
    if (eventItems.length) groupedLocal.push({ kind: "event", items: eventItems });
    if (categoryItems.length) groupedLocal.push({ kind: "category", items: categoryItems });
    if (locationItems.length) groupedLocal.push({ kind: "location", items: locationItems });

    const flatLocal = groupedLocal.flatMap((g) => g.items);
    return { flat: flatLocal, grouped: groupedLocal };
  }, [events, trimmed]);

  // Next 4 upcoming events for the empty-query default view
  const upcomingEvents = useMemo<Event[]>(() => {
    if (loading || loadError) return [];
    const now = new Date();
    return sortEventsByStartAsc(events.filter((e) => !isPastEvent(e, now))).slice(0, 4);
  }, [events, loading, loadError]);

  // Flat list for keyboard nav in empty-query state
  const defaultFlat = useMemo<Suggestion[]>(() => {
    if (trimmed.length > 0) return [];
    const historySuggestions: Suggestion[] = searchHistory.map((q) => ({
      id: `history:${q}`,
      kind: "history" as const,
      label: q,
      queryValue: q,
    }));
    const upcomingSuggestions: Suggestion[] = upcomingEvents.map((e) => ({
      id: `upcoming:${e.id}`,
      kind: "event" as const,
      label: e.Title,
      secondary: [e.Category, e.Location].filter(Boolean).join(" · ") || undefined,
      queryValue: e.Title,
      href: `/events/${e.id}`,
    }));
    return [...historySuggestions, ...upcomingSuggestions];
  }, [trimmed, searchHistory, upcomingEvents]);

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [trimmed]);

  // Clamp active index when list lengths change (e.g. removing a history item)
  useEffect(() => {
    const navLen = trimmed.length === 0 ? defaultFlat.length : flat.length;
    if (activeIndex >= navLen) setActiveIndex(navLen - 1);
  }, [defaultFlat.length, flat.length, trimmed, activeIndex]);

  // Close on outside click
  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  const router = useRouter();

  const hasDefaultContent =
    !trimmed &&
    (loading ||
      searchHistory.length > 0 ||
      (!loadError && upcomingEvents.length > 0));

  const shouldShowDropdown = open && (trimmed.length > 0 || hasDefaultContent);

  // History helpers
  function saveToHistory(query: string) {
    const q = query.trim();
    if (!q) return;
    setSearchHistory((prev) => {
      const next = [q, ...prev.filter((x) => x !== q)].slice(0, HISTORY_MAX);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function removeHistoryItem(query: string) {
    setSearchHistory((prev) => {
      const next = prev.filter((x) => x !== query);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function clearHistory() {
    setSearchHistory([]);
    try { localStorage.removeItem(HISTORY_KEY); } catch {}
  }

  function commitSuggestion(item: Suggestion) {
    setOpen(false);
    if (item.href) {
      router.push(item.href);
    } else {
      onChange(item.queryValue);
      onSubmit(item.queryValue);
    }
  }

  function commit(query: string) {
    const q = query.trim();
    if (!q) return;
    saveToHistory(q);
    setOpen(false);
    onChange(q);
    onSubmit(q);
  }

  const Dropdown = () => (
    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-amber-500/20 bg-[rgba(255,253,245,0.94)] shadow-[0_20px_48px_rgba(100,70,30,0.13),0_4px_12px_rgba(100,70,30,0.07),inset_0_1px_0_rgba(255,255,220,0.5)] [backdrop-filter:blur(24px)_saturate(1.4)] dark:border-white/9 dark:bg-[rgba(18,18,18,0.92)] dark:shadow-[0_20px_48px_rgba(0,0,0,0.45),0_4px_12px_rgba(0,0,0,0.25)]">
      <div className="relative max-h-[60vh] overflow-auto">
        {loading ? (
          <div className="flex items-center gap-2 px-4 py-4 text-sm text-amber-600/70 dark:text-amber-400/60">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Loading suggestions…
          </div>
        ) : trimmed.length === 0 ? (
          <>
            {/* Recent Searches */}
            {searchHistory.length > 0 && (
              <div>
                <div className="flex items-center gap-2 px-4 pb-1 pt-3">
                  <KindIcon kind="history" className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600/80 dark:text-amber-400/80">
                    Recent Searches
                  </span>
                  <div className="h-px flex-1 bg-amber-300/40 dark:bg-amber-700/30" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); clearHistory(); }}
                    className="ml-1 shrink-0 text-[10px] text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                  >
                    Clear all
                  </button>
                </div>

                {searchHistory.map((q) => {
                  const item: Suggestion = { id: `history:${q}`, kind: "history", label: q, queryValue: q };
                  const idx = defaultFlat.findIndex((x) => x.id === item.id);
                  const active = idx === activeIndex;
                  return (
                    <div
                      key={item.id}
                      className={`relative flex w-full items-center gap-3 px-4 py-2.5 transition-colors duration-100 ${
                        active ? "bg-amber-50 dark:bg-amber-950/40" : "hover:bg-amber-50/50 dark:hover:bg-white/5"
                      }`}
                    >
                      <AccentBar active={active} />
                      <button
                        type="button"
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => commitSuggestion(item)}
                        className="flex flex-1 items-center gap-3 text-left"
                      >
                        <ItemIcon kind="history" />
                        <span className={`block truncate text-sm font-medium ${active ? "text-amber-800 dark:text-amber-200" : "text-zinc-800 dark:text-zinc-200"}`}>
                          {q}
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove "${q}" from history`}
                        onClick={(e) => { e.stopPropagation(); removeHistoryItem(q); }}
                        className="shrink-0 rounded p-0.5 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                      {active && <ArrowRight />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Divider between sections */}
            {searchHistory.length > 0 && upcomingEvents.length > 0 && (
              <div className="mx-4 mt-2 h-px bg-amber-200/30 dark:bg-white/6" />
            )}

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div>
                <div className="flex items-center gap-2 px-4 pb-1 pt-3">
                  <KindIcon kind="event" className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600/80 dark:text-amber-400/80">
                    Upcoming Events
                  </span>
                  <div className="h-px flex-1 bg-amber-300/40 dark:bg-amber-700/30" />
                </div>

                {upcomingEvents.map((e) => {
                  const item: Suggestion = {
                    id: `upcoming:${e.id}`,
                    kind: "event",
                    label: e.Title,
                    secondary: [e.Category, e.Location].filter(Boolean).join(" · ") || undefined,
                    queryValue: e.Title,
                    href: `/events/${e.id}`,
                  };
                  const idx = defaultFlat.findIndex((x) => x.id === item.id);
                  const active = idx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => commitSuggestion(item)}
                      className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 ${
                        active ? "bg-amber-50 dark:bg-amber-950/40" : "hover:bg-amber-50/50 dark:hover:bg-white/5"
                      }`}
                    >
                      <AccentBar active={active} />
                      <ItemIcon kind="event" />
                      <div className="min-w-0 flex-1">
                        <span className={`block truncate text-sm font-medium ${active ? "text-amber-800 dark:text-amber-200" : "text-zinc-800 dark:text-zinc-200"}`}>
                          {e.Title}
                        </span>
                        {item.secondary && (
                          <span className="mt-0.5 block truncate text-xs text-zinc-400 dark:text-zinc-500">
                            {item.secondary}
                          </span>
                        )}
                      </div>
                      {active && <ArrowRight />}
                    </button>
                  );
                })}
              </div>
            )}

            <Footer />
          </>
        ) : loadError ? (
          <div className="px-4 py-4 text-sm text-zinc-500 dark:text-zinc-400">
            Couldn't load suggestions — make sure the server is running.
          </div>
        ) : flat.length === 0 ? (
          <div className="px-4 py-4 text-sm text-zinc-500 dark:text-zinc-400">
            No matches for <span className="font-medium text-zinc-700 dark:text-zinc-300">"{trimmed}"</span>
          </div>
        ) : (
          <>
            {grouped.map((group, gi) => (
              <div key={group.kind}>
                <div className="flex items-center gap-2 px-4 pb-1 pt-3">
                  <KindIcon kind={group.kind} className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600/80 dark:text-amber-400/80">
                    {kindLabel(group.kind)}
                  </span>
                  <div className="h-px flex-1 bg-amber-300/40 dark:bg-amber-700/30" />
                </div>

                {group.items.map((item) => {
                  const idx = flat.findIndex((x) => x.id === item.id);
                  const active = idx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => commitSuggestion(item)}
                      className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 ${
                        active ? "bg-amber-50 dark:bg-amber-950/40" : "hover:bg-amber-50/50 dark:hover:bg-white/5"
                      }`}
                    >
                      <AccentBar active={active} />
                      <ItemIcon kind={group.kind} />
                      <div className="min-w-0 flex-1">
                        <span className={`block truncate text-sm font-medium ${active ? "text-amber-800 dark:text-amber-200" : "text-zinc-800 dark:text-zinc-200"}`}>
                          {item.label}
                        </span>
                        {item.secondary && (
                          <span className="mt-0.5 block truncate text-xs text-zinc-400 dark:text-zinc-500">
                            {item.secondary}
                          </span>
                        )}
                      </div>
                      {active && <ArrowRight />}
                    </button>
                  );
                })}

                {gi < grouped.length - 1 && (
                  <div className="mx-4 mt-2 h-px bg-amber-200/30 dark:bg-white/6" />
                )}
              </div>
            ))}
            <Footer />
          </>
        )}
      </div>
    </div>
  );

  return (
    <div
      ref={rootRef}
      className={containerClassName ?? "relative flex w-full min-w-0 max-w-xl items-center gap-3"}
    >
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            return;
          }
          const navList = trimmed.length === 0 ? defaultFlat : flat;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!navList.length) return;
            setOpen(true);
            setActiveIndex((i) => Math.min(i + 1, navList.length - 1));
            return;
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            if (!navList.length) return;
            setOpen(true);
            setActiveIndex((i) => Math.max(i - 1, 0));
            return;
          }
          if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex < navList.length) {
              commitSuggestion(navList[activeIndex]);
            } else {
              commit(value);
            }
          }
        }}
        className={
          inputClassName ??
          "glass-surface h-11 flex-1 rounded-xl border-2 border-gray-400 px-4 text-sm text-black outline-none transition-colors duration-300 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
        }
      />

      <button
        type="button"
        aria-label="Search"
        onClick={() => commit(value)}
        className={
          buttonClassName ??
          "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-gray-400 text-zinc-800 transition hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-[#222222]"
        }
      >
        <SearchIcon className="h-6 w-6" />
      </button>

      {shouldShowDropdown && <Dropdown />}
    </div>
  );
}

function Footer() {
  return (
    <div className="flex items-center gap-3 border-t border-amber-200/30 px-4 py-2 dark:border-white/6">
      <span className="text-[10px] text-zinc-400 dark:text-zinc-600">
        <kbd className="rounded bg-zinc-100 px-1 py-0.5 font-mono dark:bg-zinc-800">↑↓</kbd> navigate
      </span>
      <span className="text-[10px] text-zinc-400 dark:text-zinc-600">
        <kbd className="rounded bg-zinc-100 px-1 py-0.5 font-mono dark:bg-zinc-800">↵</kbd> select
      </span>
      <span className="text-[10px] text-zinc-400 dark:text-zinc-600">
        <kbd className="rounded bg-zinc-100 px-1 py-0.5 font-mono dark:bg-zinc-800">Esc</kbd> close
      </span>
    </div>
  );
}
