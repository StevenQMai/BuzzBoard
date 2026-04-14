import Link from "next/link";
import type { Event } from "@/lib/utils";
import {
  formatEventDateHeading,
  formatTimeRange,
  relativeStartsIn,
  shouldShowTodayTimeBadge,
} from "@/lib/eventTime";

type Props = {
  event: Event;
  variant?: "default" | "soon";
  onQuickView?: (event: Event) => void;
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

export default function EventCard({
  event,
  variant = "default",
  onQuickView,
}: Props) {
  const showToday = shouldShowTodayTimeBadge(event);
  const rel = showToday ? null : relativeStartsIn(event);
  const isSoon = variant === "soon";

  return (
    <article
      className={`glass-surface group flex h-full flex-col rounded-2xl border border-zinc-200/80 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-700/80 ${
        isSoon ? "ring-1 ring-amber-500/20 dark:ring-amber-400/15" : ""
      }`}
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <span className="inline-flex max-w-[70%] items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {event.Category || "Event"}
          </span>
          {showToday ? (
            <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
              Today
            </span>
          ) : (
            rel && (
              <span className="shrink-0 text-xs font-medium text-amber-700 dark:text-amber-400/90">
                {rel}
              </span>
            )
          )}
        </div>

        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1">
            <Link
              href={`/events/${event.id}`}
              className="line-clamp-2 text-lg font-semibold tracking-tight text-zinc-900 hover:underline dark:text-zinc-50"
            >
              {event.Title}
            </Link>
          </h3>

          <button
            type="button"
            onClick={() => onQuickView?.(event)}
            aria-label={`Quick view ${event.Title}`}
            className="glass-surface inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-1 text-sm text-zinc-500 dark:text-zinc-400">
          {formatEventDateHeading(event)}
          <span className="text-zinc-400 dark:text-zinc-500"> · </span>
          {formatTimeRange(event)}
        </p>

        <p className="mb-4 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-300">
          {event.Location}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {event.Host_display_name
              ? `Hosted by ${event.Host_display_name}`
              : event.Organization || "Campus"}
          </span>
          <Link
            href={`/events/${event.id}`}
            className="text-sm font-medium text-zinc-900 hover:underline dark:text-white"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
