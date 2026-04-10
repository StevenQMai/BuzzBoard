"use client";

import Image from "next/image";
import { useState } from "react";
import FilterDropdown from "./FilterDropdown";

type NavbarProps = {
  search?: string;
  setSearch?: (value: string) => void;
};

export default function Navbar({ search = "", setSearch }: NavbarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
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
          value={search}
          onChange={(e) => setSearch?.(e.target.value)}
          className="w-96 rounded-md border border-gray-200 px-4 py-3 text-sm outline-none"
        />

        <div className="relative">
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="rounded px-3 py-2 text-sm transition hover:bg-gray-100"
          >
            ☰
          </button>

          {showFilters && <FilterDropdown />}
        </div>
      </div>
    </nav>
  );
}