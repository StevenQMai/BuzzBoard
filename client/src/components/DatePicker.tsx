"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  value: string; // YYYY-MM-DD
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
};

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function parseLocal(dateStr: string): Date | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function formatDisplay(dateStr: string): string {
  const d = parseLocal(dateStr);
  if (!d) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DatePicker({ value, onChange, className = "", placeholder = "Pick a date" }: Props) {
  const [open, setOpen] = useState(false);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setPopupPos({ top: rect.bottom + 6, left: rect.left });
    const d = parseLocal(value);
    if (d) { setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); }
    setOpen(true);
  };

  // Close on outside click (checks both trigger and popup)
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !popupRef.current?.contains(t)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
  const selectedD = parseLocal(value);

  const selectDay = (day: number) => {
    onChange(toDateStr(viewYear, viewMonth, day));
    setOpen(false);
  };

  const popup = open && popupPos ? (
    <div
      ref={popupRef}
      className="glass-surface-strong fixed z-[200] w-[280px] rounded-2xl border-2 border-gray-500 p-4 shadow-xl dark:border-gray-500"
      style={{ top: popupPos.top, left: popupPos.left }}
    >
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={prevMonth} className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-black/5 dark:hover:bg-white/10" aria-label="Previous month">
          <ChevronLeftIcon />
        </button>
        <span className="text-sm font-semibold text-zinc-800 dark:text-white">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button type="button" onClick={nextMonth} className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-black/5 dark:hover:bg-white/10" aria-label="Next month">
          <ChevronRightIcon />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 text-center">
        {DAYS.map((d) => (
          <div key={d} className="py-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 text-center">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const cellStr = toDateStr(viewYear, viewMonth, day);
          const isSelected =
            selectedD &&
            selectedD.getFullYear() === viewYear &&
            selectedD.getMonth() === viewMonth &&
            selectedD.getDate() === day;
          const isToday = cellStr === todayStr;
          return (
            <button
              key={i}
              type="button"
              onClick={() => selectDay(day)}
              className={`mx-auto my-0.5 flex h-8 w-8 items-center justify-center rounded-full text-sm transition ${
                isSelected
                  ? "bg-amber-500 font-semibold text-white"
                  : isToday
                  ? "ring-2 ring-amber-400 font-medium text-zinc-800 dark:text-white hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  : "text-zinc-700 hover:bg-black/5 dark:text-zinc-200 dark:hover:bg-white/10"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {value && (
        <div className="mt-3 border-t border-gray-400/30 pt-2 text-right dark:border-gray-500/30">
          <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
            Clear
          </button>
        </div>
      )}
    </div>
  ) : null;

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={open ? () => setOpen(false) : handleOpen}
        className="glass-surface flex h-10 w-full items-center gap-2 rounded-xl border-2 border-gray-400 px-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-amber-400/60 dark:border-gray-500"
      >
        <CalendarIcon />
        <span className={value ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-500"}>
          {value ? formatDisplay(value) : placeholder}
        </span>
      </button>

      {typeof document !== "undefined" && createPortal(popup, document.body)}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}
function ChevronLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  );
}
function ChevronRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}
