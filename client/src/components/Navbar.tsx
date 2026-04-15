"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import FilterDropdown from "./FilterDropdown";
import DarkModeToggle from "./DarkModeToggle";
import FriendsSidebar from "./FriendsSidebar";
import { useFriends } from "@/hooks/useFriends";

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
  const [friendsOpen, setFriendsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const { pendingRequests } = useFriends(user?.uid ?? null);
  const fullName = user?.displayName || "User";

  return (
    <div className="sticky top-0 z-40 px-[clamp(1rem,3vw,2rem)] pt-[clamp(0.5rem,1.5vw,1rem)] pb-2">
      <nav className="glass-surface mx-auto flex w-full max-w-[92%] items-center justify-between rounded-[clamp(16px,3vw,28px)] border-2 border-gray-400 px-[clamp(1rem,2.5vw,1.5rem)] py-[clamp(0.5rem,1vw,0.75rem)] transition-colors duration-300 dark:border-gray-600">
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
            <Link
              href="/map"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-gray-400 text-zinc-800 transition hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-[#222222]"
              aria-label="Campus Map"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </Link>
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
            <Link
              href="/map"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-gray-400 text-zinc-800 transition hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-[#222222]"
              aria-label="Campus Map"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </Link>

            <button
              type="button"
              onClick={() => setFriendsOpen(true)}
              className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-gray-400 text-zinc-800 transition hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-[#222222]"
              aria-label="Friends"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <DarkModeToggle />

            <Link
              href="/profile"
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

            <Link
              href="/profile"
              className="rounded-xl border-2 border-gray-400 px-4 py-2 text-sm transition hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-[#222222]"
            >
              Profile
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

      {user && (
        <FriendsSidebar open={friendsOpen} onClose={() => setFriendsOpen(false)} />
      )}
    </div>
  );
}
