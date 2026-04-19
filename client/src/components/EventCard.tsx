import Link from "next/link";
import type { Event } from "@/lib/utils";
import {
  formatTimeRange,
  relativeStartsIn,
  shouldShowTodayTimeBadge,
  parseEventStart,
} from "@/lib/eventTime";

type Props = {
  event: Event;
  variant?: "default" | "soon";
  onQuickView?: (event: Event) => void;
  scheduleTags?: string[];
  rsvpCount?: number;
};

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}

const DARK_BANNER = "dark:from-[#B87D4B] dark:to-[#B87D4B]";

const PASTEL_GRADIENTS: Record<string, string> = {
  Tech:     `from-blue-100 to-indigo-100 ${DARK_BANNER}`,
  Social:   `from-pink-100 to-rose-100 ${DARK_BANNER}`,
  Sports:   `from-emerald-100 to-teal-100 ${DARK_BANNER}`,
  Music:    `from-violet-100 to-purple-100 ${DARK_BANNER}`,
  Food:     `from-orange-100 to-amber-100 ${DARK_BANNER}`,
  Workshop: `from-cyan-100 to-sky-100 ${DARK_BANNER}`,
  Career:   `from-slate-100 to-zinc-100 ${DARK_BANNER}`,
};

export function getBannerGradient(category: string): string {
  for (const [key, val] of Object.entries(PASTEL_GRADIENTS)) {
    if (category.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return `from-amber-100 to-yellow-100 ${DARK_BANNER}`;
}

export default function EventCard({
  event,
  variant = "default",
  onQuickView,
  scheduleTags,
  rsvpCount,
}: Props) {
  const showToday = shouldShowTodayTimeBadge(event);
  const rel = showToday ? null : relativeStartsIn(event);

  const start = parseEventStart(event);
  const dayNum = start ? start.getDate().toString().padStart(2, "0") : "--";
  const monthAbbr = start
    ? start.toLocaleDateString(undefined, { month: "short" }).toUpperCase()
    : "";

  const gradient = getBannerGradient(event.Category || "");

  return (
    <article className="glass-surface group flex h-full flex-col overflow-hidden rounded-2xl border-2 border-zinc-300 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-600">
      {/* Banner */}
      <div className={`relative flex h-28 items-end ${event.Image_url ? "" : `bg-linear-to-br ${gradient}`} overflow-hidden`}>
        {event.Image_url && (
          <img
            src={event.Image_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Category badge — top-left */}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white/80 px-2 py-[3px] text-[11px] font-semibold text-zinc-700 backdrop-blur-sm dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
          {event.Category || "Event"}
        </span>

        {/* Time badge — top-right */}
        {showToday ? (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white/80 px-2 py-[3px] text-[11px] font-semibold text-emerald-700 backdrop-blur-sm dark:border-emerald-700 dark:bg-zinc-800/80 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Today
          </span>
        ) : (
          rel && (
            <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-white/80 px-2 py-[3px] text-[11px] font-medium text-amber-700 backdrop-blur-sm dark:border-amber-700 dark:bg-zinc-800/80 dark:text-amber-400">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {rel}
            </span>
          )
        )}

        {/* Quick-view eye — bottom-right of banner */}
        <button
          type="button"
          onClick={() => onQuickView?.(event)}
          aria-label={`Quick view ${event.Title}`}
          className="absolute right-3 bottom-3 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white/80 text-zinc-600 backdrop-blur-sm transition duration-200 hover:scale-110 hover:text-amber-600 hover:ring-2 hover:ring-amber-400/50 dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:text-amber-400 dark:hover:ring-amber-400/40"
        >
          <EyeIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-4 pt-4 pb-4 bg-amber-50 dark:bg-zinc-800">
        {/* Title */}
        <h3 className="mb-3">
          <Link
            href={`/events/${event.id}`}
            className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-zinc-900 hover:underline dark:text-zinc-50"
          >
            {event.Title}
          </Link>
        </h3>

        {/* Schedule tags */}
        {scheduleTags && scheduleTags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {scheduleTags.map((t) => {
              const isFit = t === "Fits your schedule";
              return (
                <span
                  key={t}
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-[2px] text-[10px] font-medium ${
                    isFit
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-400"
                  }`}
                >
                  {isFit ? (
                    <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  )}
                  {t}
                </span>
              );
            })}
          </div>
        )}

        {/* Date + details row */}
        <div className="mb-4 flex items-start gap-4">
          {/* Large stacked date */}
          <div className="flex flex-col items-center leading-none">
            <span className="text-2xl font-bold text-zinc-900 dark:text-white">{dayNum}</span>
            <span className="text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400">{monthAbbr}</span>
          </div>

          {/* Location + time */}
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-start gap-1.5">
              <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <p className="line-clamp-2 text-sm leading-snug text-zinc-700 dark:text-zinc-300">
                {event.Location}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {formatTimeRange(event)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="min-w-0 truncate text-xs text-zinc-400 dark:text-zinc-500">
            {event.Host_display_name
              ? `by ${event.Host_display_name}`
              : event.Organization || ""}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            {rsvpCount !== undefined && rsvpCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM1.49 15.326a.78.78 0 0 1-.358-.442 3 3 0 0 1 4.308-3.516 6.484 6.484 0 0 0-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 0 1-2.07-.655ZM16.44 15.98a4.97 4.97 0 0 0 2.07-.654.78.78 0 0 0 .357-.442 3 3 0 0 0-4.308-3.517 6.484 6.484 0 0 1 1.907 3.96 2.32 2.32 0 0 1-.026.654ZM18 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM5.304 16.19a.844.844 0 0 1-.277-.71 5 5 0 0 1 9.947 0 .843.843 0 0 1-.277.71A6.975 6.975 0 0 1 10 18a6.974 6.974 0 0 1-4.696-1.81Z" />
                </svg>
                {rsvpCount}
              </span>
            )}
            <Link
              href={`/events/${event.id}`}
              className="inline-flex items-center rounded-lg border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
