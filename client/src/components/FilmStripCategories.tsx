"use client";

import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// ─── Category data ────────────────────────────────────────────────────────────

type Category = { id: string; label: string; gradient: string; darkGradient: string };

const CATEGORIES: Category[] = [
  { id: "All",      label: "All Events", gradient: "from-amber-100 to-yellow-100",   darkGradient: "dark:from-[#B87D4B] dark:to-[#B87D4B]" },
  { id: "Social",   label: "Social",     gradient: "from-pink-100 to-rose-100",      darkGradient: "dark:from-[#B87D4B] dark:to-[#B87D4B]" },
  { id: "Sports",   label: "Sports",     gradient: "from-emerald-100 to-teal-100",   darkGradient: "dark:from-[#B87D4B] dark:to-[#B87D4B]" },
  { id: "Music",    label: "Music",      gradient: "from-violet-100 to-purple-100",  darkGradient: "dark:from-[#B87D4B] dark:to-[#B87D4B]" },
  { id: "Food",     label: "Food",       gradient: "from-orange-100 to-amber-100",   darkGradient: "dark:from-[#B87D4B] dark:to-[#B87D4B]" },
  { id: "Tech",     label: "Tech",       gradient: "from-blue-100 to-indigo-100",    darkGradient: "dark:from-[#B87D4B] dark:to-[#B87D4B]" },
  { id: "Workshop", label: "Workshop",   gradient: "from-cyan-100 to-sky-100",       darkGradient: "dark:from-[#B87D4B] dark:to-[#B87D4B]" },
  { id: "Career",   label: "Career",     gradient: "from-slate-100 to-zinc-100",     darkGradient: "dark:from-[#B87D4B] dark:to-[#B87D4B]" },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

function Icon({ id }: { id: string }) {
  const s = { fill: "none", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const cls = "stroke-zinc-600 dark:stroke-zinc-300";
  switch (id) {
    case "All":
      return (
        <svg viewBox="0 0 24 24" width="36" height="36" className={cls} {...s}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "Social":
      return (
        <svg viewBox="0 0 24 24" width="36" height="36" className={cls} {...s}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "Sports":
      return (
        <svg viewBox="0 0 24 24" width="36" height="36" className={cls} {...s}>
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
      );
    case "Music":
      return (
        <svg viewBox="0 0 24 24" width="36" height="36" className={cls} {...s}>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
    case "Food":
      return (
        <svg viewBox="0 0 24 24" width="36" height="36" className={cls} {...s}>
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
          <path d="M7 2v20" />
          <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
      );
    case "Tech":
      return (
        <svg viewBox="0 0 24 24" width="36" height="36" className={cls} {...s}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
          <line x1="15" y1="9" x2="9" y2="15" />
        </svg>
      );
    case "Workshop":
      return (
        <svg viewBox="0 0 24 24" width="36" height="36" className={cls} {...s}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
        </svg>
      );
    case "Career":
      return (
        <svg viewBox="0 0 24 24" width="36" height="36" className={cls} {...s}>
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    default:
      return null;
  }
}

// ─── Single frame ─────────────────────────────────────────────────────────────

type FrameProps = {
  category: Category;
  isActive: boolean;
  onSelect: () => void;
  onEnter: () => void;
  onLeave: () => void;
};

function Frame({ category, isActive, onSelect, onEnter, onLeave }: FrameProps) {
  const { gradient, darkGradient, label, id } = category;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={`relative flex-shrink-0 cursor-pointer select-none overflow-hidden rounded-2xl border-2 bg-linear-to-br transition-colors duration-200 ${gradient} ${darkGradient} ${
        isActive
          ? "border-amber-500 shadow-md dark:border-amber-400"
          : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-500"
      }`}
      style={{ width: 120, height: 140 }}
      aria-label={label}
      aria-pressed={isActive}
    >
      {/* Active indicator bar */}
      {isActive && (
        <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-amber-500 dark:bg-amber-400" />
      )}

      {/* Icon */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: -8 }}>
        <Icon id={id} />
      </div>

      {/* Label */}
      <div className="absolute inset-x-0 bottom-0 pb-3 text-center">
        <span
          className={`text-[10px] font-bold uppercase tracking-widest ${
            isActive
              ? "text-amber-700 dark:text-amber-300"
              : "text-zinc-600 dark:text-zinc-300"
          }`}
        >
          {label}
        </span>
      </div>
    </motion.button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Props = {
  active?: string;
  onSelect?: (id: string) => void;
};

const NORMAL_SPEED  = 80;   // px/s auto-scroll
const SLOW_SPEED    = 35;   // px/s on container hover
const FRICTION      = 0.92; // velocity multiplier per 16ms frame
const MIN_MOMENTUM  = 15;   // px/s — below this, exit momentum mode

function wrap(val: number, half: number): number {
  let n = val % half;
  if (n > 0) n -= half;
  return n;
}

const TRACK_GAP = 8; // gap between the two half-divs

export default function FilmStripCategories({ active = "All", onSelect }: Props) {
  const x              = useMotionValue(0);
  const speedRef       = useRef(NORMAL_SPEED);
  const halfWidthRef   = useRef(0);
  const measureRef     = useRef<HTMLDivElement>(null);
  const containerRef   = useRef<HTMLDivElement>(null);
  const containerHover = useRef(false);
  const frameHover     = useRef(false);
  const dragging       = useRef(false);
  const momentum       = useRef(false);
  const velocityRef    = useRef(0);
  const dragStartX     = useRef(0);
  const lastPtrX       = useRef(0);
  const lastPtrT       = useRef(0);
  const prevPtrX       = useRef(0);
  const prevPtrT       = useRef(0);
  const [, forceRender] = useState(0);

  // Half-width must include the gap between the two halves for a seamless loop
  useEffect(() => {
    if (measureRef.current) {
      halfWidthRef.current = measureRef.current.offsetWidth + TRACK_GAP;
    }
  }, []);

  // Two-finger trackpad swipe — must be a non-passive listener to preventDefault
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) < 2) return;
      e.preventDefault();
      momentum.current = false;
      const half = halfWidthRef.current;
      if (!half) return;
      x.set(wrap(x.get() - e.deltaX, half));
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [x]);

  useAnimationFrame((_, delta) => {
    const half = halfWidthRef.current;
    if (!half) return;

    if (dragging.current) return;

    if (momentum.current) {
      velocityRef.current *= Math.pow(FRICTION, delta / 16.67);
      let next = x.get() + velocityRef.current * (delta / 1000);
      x.set(wrap(next, half));
      if (Math.abs(velocityRef.current) < MIN_MOMENTUM) {
        momentum.current = false;
        velocityRef.current = 0;
      }
      return;
    }

    if (frameHover.current) { speedRef.current = 0; return; }
    speedRef.current = containerHover.current ? SLOW_SPEED : NORMAL_SPEED;
    let next = x.get() - speedRef.current * (delta / 1000);
    if (next <= -half) next += half;
    x.set(next);
  });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    momentum.current = false;
    velocityRef.current = 0;
    dragStartX.current = e.clientX - x.get();
    lastPtrX.current = e.clientX;
    lastPtrT.current = performance.now();
    prevPtrX.current = e.clientX;
    prevPtrT.current = performance.now();
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const now = performance.now();
    prevPtrX.current = lastPtrX.current;
    prevPtrT.current = lastPtrT.current;
    lastPtrX.current = e.clientX;
    lastPtrT.current = now;
    x.set(e.clientX - dragStartX.current);
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const half = halfWidthRef.current;
    if (half) x.set(wrap(x.get(), half));

    const dt = lastPtrT.current - prevPtrT.current;
    if (dt > 0 && dt < 120) {
      const v = ((lastPtrX.current - prevPtrX.current) / dt) * 1000;
      if (Math.abs(v) > 80) {
        velocityRef.current = v;
        momentum.current = true;
        return;
      }
    }
    momentum.current = false;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ cursor: "grab" }}
      onMouseEnter={() => { containerHover.current = true; }}
      onMouseLeave={() => { containerHover.current = false; frameHover.current = false; }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Edge fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-[#fefcf3] to-transparent dark:from-[#111111]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-[#fefcf3] to-transparent dark:from-[#111111]" />

      {/* Scrolling track */}
      <motion.div
        className="flex"
        style={{ x, gap: 8, paddingLeft: 8, paddingRight: 8, paddingTop: 8, paddingBottom: 8 }}
      >
        {/* Measured first half */}
        <div ref={measureRef} className="flex" style={{ gap: 8 }}>
          {CATEGORIES.map((cat, i) => (
            <Frame
              key={`a-${cat.id}`}
              category={cat}
              isActive={active === cat.id}
              onSelect={() => { onSelect?.(cat.id); forceRender(n => n + 1); }}
              onEnter={() => { frameHover.current = true; }}
              onLeave={() => { frameHover.current = false; }}
            />
          ))}
        </div>
        {/* Duplicate for seamless loop */}
        <div className="flex" style={{ gap: 8 }}>
          {CATEGORIES.map((cat, i) => (
            <Frame
              key={`b-${cat.id}`}
              category={cat}
              isActive={active === cat.id}
              onSelect={() => { onSelect?.(cat.id); forceRender(n => n + 1); }}
              onEnter={() => { frameHover.current = true; }}
              onLeave={() => { frameHover.current = false; }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
