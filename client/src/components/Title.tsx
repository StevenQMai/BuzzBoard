"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function Hero() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  if (user) return null;

  return (
    <section className="flex flex-col items-center px-4 pb-16 pt-16 text-center transition-colors duration-300">
      <Image
        src="/buzz.png"
        alt="Georgia Tech Buzz logo"
        width={120}
        height={120}
        className="mb-6 object-contain"
      />

      <h1 className="mb-4 max-w-2xl text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
        Campus moments, all in one place
      </h1>

      <p className="max-w-lg text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
        Discover study sessions, hangouts, and small gatherings around campus.
        Browse everything below. When you&apos;re ready to host,{" "}
        <Link
          href="/login"
          className="font-medium text-zinc-800 underline decoration-zinc-300 underline-offset-2 transition hover:decoration-zinc-500 dark:text-zinc-200 dark:decoration-zinc-600 dark:hover:decoration-zinc-400"
        >
          sign in
        </Link>{" "}
        or{" "}
        <Link
          href="/signup"
          className="font-medium text-zinc-800 underline decoration-zinc-300 underline-offset-2 transition hover:decoration-zinc-500 dark:text-zinc-200 dark:decoration-zinc-600 dark:hover:decoration-zinc-400"
        >
          sign up
        </Link>
        .
      </p>

      <a
        href="#events-feed"
        className="hero-feed-cue mt-10 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 no-underline transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        Explore upcoming events
        <span aria-hidden className="text-base leading-none">
          ↓
        </span>
      </a>
    </section>
  );
}
