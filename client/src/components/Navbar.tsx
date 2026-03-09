"use client";

import Image from "next/image";
import { useState } from "react";
import FilterDropdown from "./FilterDropdown";

export default function Navbar() {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <nav className="flex items-center justify-between bg-white px-8 py-4">
      <div className="flex items-center gap-3">
        <Image
          src="/gt-logo.png"
          alt="Georgia Tech logo"
          width={42}
          height={42}
          className="object-contain"
        />
        <span className="text-3xl font-semibold text-black">BuzzBoard</span>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search"
          className="w-72 rounded border border-gray-200 px-4 py-2 text-sm outline-none"
        />

        <button
  className="rounded px-3 py-2 text-sm transition hover:bg-gray-100"
>
  ⌕
</button>

        <div className="relative">
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="rounded px-3 py-2 text-sm transition hover:bg-gray-100"
          >
            ▽
          </button>

          {showFilters && <FilterDropdown />}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="rounded border border-black px-5 py-2 text-sm transition hover:bg-gray-100">
          Sign In
        </button>
        <button className="rounded bg-black px-5 py-2 text-sm text-white transition hover:bg-gray-800">
          Sign Up
        </button>
      </div>
    </nav>
  );
}