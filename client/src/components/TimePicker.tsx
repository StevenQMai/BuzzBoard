"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// ─── Constants ────────────────────────────────────────────────────────────────
const ITEM_H = 46;   // px per row
const VISIBLE = 5;   // rows visible in the drum
const PAD = ITEM_H * 2; // top/bottom padding so first/last item can center

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));
const PERIODS = ["AM", "PM"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parse(value: string): [string, string, string] {
  if (!value) return ["12", "00", "PM"];
  const [hStr, mStr = "00"] = value.split(":");
  let h = parseInt(hStr, 10);
  const rawM = parseInt(mStr, 10);
  const m = Math.min(Math.round(rawM / 5) * 5, 55);
  const period = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return [String(h).padStart(2, "0"), String(m).padStart(2, "0"), period];
}

function combine(hour: string, minute: string, period: string): string {
  let h = parseInt(hour, 10);
  if (period === "AM") { if (h === 12) h = 0; }
  else { if (h !== 12) h += 12; }
  return `${String(h).padStart(2, "0")}:${minute}`;
}

function display(value: string): string {
  if (!value) return "";
  const [h, m, p] = parse(value);
  return `${parseInt(h, 10)}:${m} ${p}`;
}

// ─── DrumColumn ───────────────────────────────────────────────────────────────
type ColProps = {
  items: string[];
  value: string;
  onChange: (v: string) => void;
  narrow?: boolean;
};

function DrumColumn({ items, value, onChange, narrow = false }: ColProps) {
  const [visual, setVisual] = useState(value);
  const scrollRef = useRef<HTMLDivElement>(null);
  const settling = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Scroll to initial position instantly on mount
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = items.indexOf(value);
    if (idx >= 0) el.scrollTop = idx * ITEM_H;
    setVisual(value);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const snap = useCallback(
    (idx: number, emit: boolean) => {
      const el = scrollRef.current;
      if (!el) return;
      settling.current = true;
      el.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
      setTimeout(() => { settling.current = false; }, 400);
      const next = items[idx];
      setVisual(next);
      if (emit) onChange(next);
    },
    [items, onChange],
  );

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || settling.current) return;
    const nearest = Math.max(
      0,
      Math.min(Math.round(el.scrollTop / ITEM_H), items.length - 1),
    );
    setVisual(items[nearest]);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => snap(nearest, true), 90);
  }, [items, snap]);

  const clickRow = useCallback(
    (idx: number) => {
      snap(idx, true);
    },
    [snap],
  );

  return (
    <div
      className={`relative ${narrow ? "w-14" : "flex-1"}`}
      style={{ height: ITEM_H * VISIBLE }}
    >
      {/* Selection band */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 rounded-xl bg-black/[0.06] dark:bg-white/[0.09]"
        style={{ top: PAD, height: ITEM_H }}
      />

      {/* Drum scroll */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="absolute inset-0 overflow-y-scroll [&::-webkit-scrollbar]:hidden"
        style={{
          scrollSnapType: "y mandatory",
          paddingTop: PAD,
          paddingBottom: PAD,
          scrollbarWidth: "none",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 32%, black 68%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 32%, black 68%, transparent 100%)",
        }}
      >
        {items.map((item, i) => (
          <div
            key={item}
            onClick={() => clickRow(i)}
            style={{ height: ITEM_H, scrollSnapAlign: "center" }}
            className={`flex cursor-pointer select-none items-center justify-center transition-all duration-150 ${
              narrow ? "text-[15px]" : "text-[18px]"
            } ${
              item === visual
                ? "font-semibold text-zinc-900 dark:text-white"
                : "font-normal text-zinc-400 dark:text-zinc-500"
            }`}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TimePicker ───────────────────────────────────────────────────────────────
type Props = {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
};

export default function TimePicker({
  value,
  onChange,
  className = "",
  placeholder = "Pick a time",
}: Props) {
  const [open, setOpen] = useState(false);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const [initH, initM, initP] = parse(value);
  const hourRef = useRef(initH);
  const minRef = useRef(initM);
  const perRef = useRef(initP);

  // Keep refs in sync so we can combine columns without stale closures
  const emit = useCallback(() => {
    onChange(combine(hourRef.current, minRef.current, perRef.current));
  }, [onChange]);

  const onHour = useCallback((v: string) => { hourRef.current = v; emit(); }, [emit]);
  const onMin  = useCallback((v: string) => { minRef.current = v;  emit(); }, [emit]);
  const onPer  = useCallback((v: string) => { perRef.current = v;  emit(); }, [emit]);

  // Reset refs when popup opens with new value
  useEffect(() => {
    if (!open) return;
    const [h, m, p] = parse(value);
    hourRef.current = h;
    minRef.current  = m;
    perRef.current  = p;
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !popupRef.current?.contains(t))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const [ih, im, ip] = parse(value);

  const popup = open && popupPos ? (
    <div
      ref={popupRef}
      className="glass-surface-strong fixed z-[200] w-[210px] overflow-hidden rounded-2xl border-2 border-gray-500 shadow-xl dark:border-gray-500"
      style={{ top: popupPos.top, left: popupPos.left }}
    >
      {/* Column labels */}
      <div className="flex border-b border-gray-400/20 px-3 pt-3 pb-1 dark:border-gray-500/20">
        <span className="flex-1 text-center text-[10px] font-medium uppercase tracking-wide text-zinc-400">Hr</span>
        <span className="flex-1 text-center text-[10px] font-medium uppercase tracking-wide text-zinc-400">Min</span>
        <span className="w-14 text-center text-[10px] font-medium uppercase tracking-wide text-zinc-400">AM/PM</span>
      </div>
      {/* Drums */}
      <div className="flex px-2 pb-2">
        <DrumColumn key={`h-${ih}`} items={HOURS}   value={ih} onChange={onHour} />
        <DrumColumn key={`m-${im}`} items={MINUTES} value={im} onChange={onMin}  />
        <DrumColumn key={`p-${ip}`} items={PERIODS} value={ip} onChange={onPer} narrow />
      </div>
    </div>
  ) : null;

  return (
    <div className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (open) { setOpen(false); return; }
          const rect = triggerRef.current?.getBoundingClientRect();
          if (rect) setPopupPos({ top: rect.bottom + 6, left: rect.left });
          setOpen(true);
        }}
        className="glass-surface flex h-10 w-full items-center gap-2 rounded-xl border-2 border-gray-400 px-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-amber-400/60 dark:border-gray-500"
      >
        <ClockIcon />
        <span className={value ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-500"}>
          {value ? display(value) : placeholder}
        </span>
      </button>

      {typeof document !== "undefined" && createPortal(popup, document.body)}
    </div>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}
