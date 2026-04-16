"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import type { Event } from "@/lib/utils";
import {
  formatEventDateHeading,
  formatTimeRange,
  isPastEvent,
  relativeStartsIn,
} from "@/lib/eventTime";
import { useEventRsvp } from "@/hooks/useRsvp";

type Props = {
  open: boolean;
  event: Event | null;
  onClose: () => void;
  labelledById?: string;
};

function getFocusable(container: HTMLElement): HTMLElement[] {
  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");
  return Array.from(container.querySelectorAll<HTMLElement>(selectors)).filter(
    (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
  );
}

function CloseIcon({ className }: { className?: string }) {
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

export default function EventQuickViewModal({
  open,
  event,
  onClose,
  labelledById,
}: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);
  const titleId = useMemo(
    () => labelledById || `event-quick-view-title-${event?.id || "unknown"}`,
    [labelledById, event?.id]
  );
  const { isRsvpd, rsvpCount, toggle, user } = useEventRsvp(
    open ? event?.id : undefined,
  );

  useEffect(() => {
    if (!open) return;
    lastActiveRef.current = document.activeElement as HTMLElement | null;

    const t = window.setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = getFocusable(panel);
      (focusables[0] || panel).focus();
    }, 0);

    return () => {
      window.clearTimeout(t);
      lastActiveRef.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;

      const focusables = getFocusable(panel);
      if (focusables.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (!active || active === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !event) return null;

  const rel = relativeStartsIn(event);
  const past = isPastEvent(event);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="glass-surface-strong relative w-full max-w-4xl rounded-[28px] border-2 border-gray-500 shadow-2xl outline-none transition-colors duration-300 dark:border-gray-500"
      >
        <button
          type="button"
          onClick={onClose}
          className="glass-surface absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-gray-500 text-zinc-800 transition hover:bg-gray-100 dark:border-gray-500 dark:text-white dark:hover:bg-[#222222]"
          aria-label="Close quick view"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        <div className="grid gap-6 px-6 pb-6 pt-6 md:grid-cols-[320px_1fr] md:items-stretch">
          <div className="flex flex-col">
            <div className="glass-surface flex aspect-4/3 w-full items-center justify-center rounded-2xl border-2 border-gray-500 text-sm text-zinc-500 dark:border-gray-500 dark:text-zinc-400">
              pic
            </div>
            <div className="mt-4 flex gap-3">
              {user ? (
                <button
                  type="button"
                  onClick={toggle}
                  className={`h-11 flex-1 cursor-pointer rounded-xl border-2 text-sm font-medium transition duration-200 active:scale-[0.98] ${
                    isRsvpd
                      ? "border-amber-500 bg-amber-500 text-white shadow-sm hover:bg-amber-600 hover:shadow-md hover:ring-2 hover:ring-amber-300/70 dark:border-amber-400 dark:bg-amber-500 dark:hover:bg-amber-600 dark:hover:ring-amber-200/50"
                      : "border-gray-300 bg-white/85 text-zinc-900 shadow-sm hover:border-amber-500/90 hover:bg-amber-50 hover:shadow-md hover:ring-2 hover:ring-amber-400/40 dark:border-gray-600 dark:bg-zinc-900/80 dark:text-white dark:hover:border-amber-500 dark:hover:bg-amber-950/35 dark:hover:ring-amber-400/30"
                  }`}
                >
                  {isRsvpd ? `Going ✓ (${rsvpCount})` : rsvpCount > 0 ? `RSVP (${rsvpCount})` : "RSVP"}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border-2 border-gray-300 bg-white/85 text-sm font-medium text-zinc-900 shadow-sm transition duration-200 hover:border-amber-500/90 hover:bg-amber-50 hover:shadow-md hover:ring-2 hover:ring-amber-400/40 active:scale-[0.98] dark:border-gray-600 dark:bg-zinc-900/80 dark:text-white dark:hover:border-amber-500 dark:hover:bg-amber-950/35 dark:hover:ring-amber-400/30"
                >
                  Sign in to RSVP
                </Link>
              )}
              <button
                type="button"
                className="glass-surface h-11 flex-1 rounded-xl border-2 border-gray-500 text-sm font-medium text-zinc-900 transition hover:bg-gray-100 dark:border-gray-500 dark:text-white dark:hover:bg-[#222222]"
              >
                Add to Calendar
              </button>
            </div>
          </div>

          <div className="flex min-w-0 flex-col">
            <p
              id={titleId}
              className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white"
            >
              {event.Title}
            </p>

            <div className="glass-surface mt-4 flex-1 rounded-2xl border-2 border-gray-500 p-4 text-sm text-zinc-700 dark:border-gray-500 dark:text-zinc-200">
              <div className="rounded-2xl border border-zinc-200 bg-white/55 p-4 dark:border-zinc-800 dark:bg-zinc-950/30">
                <p className="font-medium text-zinc-900 dark:text-white">
                  {formatEventDateHeading(event)} · {formatTimeRange(event)}
                </p>
                <p className="mt-2">{event.Location}</p>
                <p className="mt-3 text-zinc-600 dark:text-zinc-300">
                  {event.Description || "description/time/place"}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="rounded-full border border-gray-300 bg-white/65 px-3 py-1 text-xs font-medium text-zinc-800 dark:border-gray-500 dark:bg-[#111111]/40 dark:text-zinc-200">
                    {event.Category || "categories"}
                  </span>
                  {rel && !past ? (
                    <span className="text-xs font-semibold text-amber-500">
                      {rel}
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-zinc-400">
                      {past ? "Ended" : ""}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <div className="glass-surface flex h-11 flex-1 items-center justify-center rounded-2xl border-2 border-gray-500 px-4 text-center text-sm text-zinc-600 dark:border-gray-500 dark:text-zinc-300">
                Categories
              </div>
              <Link
                href={`/events/${event.id}`}
                className="glass-surface flex h-11 flex-1 items-center justify-center rounded-2xl border-2 border-gray-500 px-4 text-center text-sm font-medium text-zinc-900 transition hover:bg-gray-100 dark:border-gray-500 dark:text-white dark:hover:bg-[#222222]"
              >
                View full details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

