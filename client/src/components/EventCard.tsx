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
};

export default function EventCard({ event, variant = "default" }: Props) {
  const showToday = shouldShowTodayTimeBadge(event);
  const rel = showToday ? null : relativeStartsIn(event);
  const isSoon = variant === "soon";

  return (
    <article
      className={`group flex h-full flex-col rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-700/80 dark:bg-zinc-900/80 ${
        isSoon ? "ring-1 ring-amber-500/20 dark:ring-amber-400/15" : ""
      }`}
    >
      <Link href={`/events/${event.id}`} className="flex flex-1 flex-col p-5">
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

        <h3 className="mb-2 line-clamp-2 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {event.Title}
        </h3>

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
          <span className="text-sm font-medium text-zinc-900 group-hover:underline dark:text-white">
            View
          </span>
        </div>
      </Link>
    </article>
  );
}
