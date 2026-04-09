"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import FilterDropdown from "./FilterDropdown";
import DarkModeToggle from "./DarkModeToggle";

export default function Navbar() {
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
    <div className="px-4 pt-4">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-[28px] border-2 border-gray-400 bg-white px-6 py-3 shadow-md transition-colors duration-300 dark:border-gray-600 dark:bg-[#1a1a1a]">
        <Link href="/home" className="flex items-center gap-3">
          <Image
            src="/gt-logo.png"
            alt="Georgia Tech logo"
            width={42}
            height={42}
            className="rounded-md object-contain"
          />
          <span className="text-3xl font-semibold text-black dark:text-white">
            BuzzBoard
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-center px-6">
          <div className="flex w-full max-w-xl items-center gap-3">
            <input
              type="text"
              placeholder="Search"
              className="h-11 flex-1 rounded-xl border-2 border-gray-400 bg-white px-4 text-sm text-black outline-none transition-colors duration-300 dark:border-gray-600 dark:bg-[#111111] dark:text-white dark:placeholder:text-gray-400"
            />

            <button className="rounded-xl border-2 border-gray-400 px-4 py-2 text-sm transition hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-[#222222]">
              ⌕
            </button>

            <div className="relative">
              <button
                onClick={() => setShowFilters((prev) => !prev)}
                className="rounded-xl border-2 border-gray-400 px-4 py-2 text-sm transition hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-[#222222]"
              >
                ▽
              </button>

              {showFilters && <FilterDropdown />}
            </div>
          </div>
        </div>

        {!user ? (
          <div className="flex items-center gap-3">
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
          <div className="flex items-center gap-3">
            <DarkModeToggle />

            <div className="flex items-center gap-3 rounded-xl border border-gray-300 px-3 py-2 transition-colors duration-300 dark:border-gray-600 dark:bg-[#111111]">
              <img
                src={user.photoURL || "https://via.placeholder.com/40?text=U"}
                alt="Profile"
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-black dark:text-white">
                {fullName}
              </span>
            </div>

            <button
              onClick={() => signOut(auth)}
              className="rounded-xl border-2 border-gray-400 px-4 py-2 text-sm transition hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-[#222222]"
            >
              Log Out
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}