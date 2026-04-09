"use client";

import { Navbar, Hero, EventGrid } from "@/components";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-[#f8f8f8] transition-colors duration-300 dark:bg-[#111111]">
      <Navbar />
      {user && (
        <div className="mx-auto mt-6 flex w-full max-w-7xl justify-end px-4">
          <Link
            href="/add-event"
            className="rounded-xl bg-black px-5 py-3 text-sm text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Add an Event
          </Link>
        </div>
      )}
      <Hero />
      <EventGrid />
    </main>
  );
}