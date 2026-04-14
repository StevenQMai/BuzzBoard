"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import FilterDropdown from "./FilterDropdown";
import DarkModeToggle from "./DarkModeToggle";

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

function ChevronDownIcon({ className }: { className?: string }) {
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
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

type NavbarProps = {
  search?: string;
  setSearch?: (value: string) => void;
  showSearch?: boolean;
};

export default function Navbar({
  search = "",
  setSearch,
  showSearch = true,
}: NavbarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const fullName = user?.displayName || "User";

  return (
    <div className="sticky top-0 z-40 px-4 pt-4 pb-2">
      <nav className="glass-surface mx-auto flex w-full max-w-7xl items-center justify-between rounded-[28px] border-2 border-gray-400 px-6 py-3 transition-colors duration-300 dark:border-gray-600">
        <Link href="/home" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/buzz.png"
            alt="Georgia Tech Buzz mascot"
            width={40}
            height={40}
            className="object-contain drop-shadow-md"
          />
          <span className="font-logo logo-stroke bg-linear-to-r from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-3xl text-transparent drop-shadow-sm dark:from-amber-400 dark:via-yellow-300 dark:to-amber-400">
            BuzzBoard
          </span>
        </Link>

        {showSearch && (
          <div className="flex min-w-0 flex-1 items-center justify-center px-6">
            <div className="flex w-full min-w-0 max-w-xl items-center gap-3">
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch?.(e.target.value)}
                className="h-11 flex-1 rounded-xl border-2 border-gray-400 bg-white px-4 text-sm text-black outline-none transition-colors duration-300 dark:border-gray-600 dark:bg-[#111111] dark:text-white dark:placeholder:text-gray-400"
              />

              <button
                type="button"
                aria-label="Search"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-gray-400 text-zinc-800 transition hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-[#222222]"
              >
                <SearchIcon className="h-6 w-6" />
              </button>

              <div className="relative">
                <button
                  type="button"
                  aria-expanded={showFilters}
                  aria-label="Open filters"
                  onClick={() => setShowFilters((prev) => !prev)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-gray-400 text-zinc-800 transition hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-[#222222]"
                >
                  <ChevronDownIcon className="h-6 w-6" />
                </button>

                {showFilters && <FilterDropdown />}
              </div>
            </div>
          </div>
        )}

        {!user ? (
          <div className="relative z-20 flex shrink-0 items-center gap-3">
            <DarkModeToggle />
            <Link
              href="/login"
              className="rounded-xl border-2 border-gray-400 px-5 py-2 text-sm transition hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-[#222222]"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-black px-5 py-2 text-sm text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Sign Up
            </Link>
          </div>
        ) : (
          <div className="relative z-20 flex shrink-0 items-center gap-3">
            <DarkModeToggle />

            <Link
              href="/dashboard"
              className="inline-flex h-10 max-w-[200px] shrink-0 items-center gap-2 rounded-xl border-2 border-gray-400 px-3 text-sm leading-none transition hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-[#222222]"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="h-6 w-6 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-300 text-xs font-semibold uppercase text-zinc-700 dark:bg-zinc-600 dark:text-zinc-100">
                  {(user.email ?? "U").charAt(0)}
                </span>
              )}
              <span className="min-w-0 truncate font-medium text-black dark:text-white">
                {fullName}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => signOut(auth)}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border-2 border-gray-400 px-4 text-sm leading-none transition hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-[#222222]"
            >
              Log Out
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}
