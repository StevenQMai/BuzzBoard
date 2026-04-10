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
    <section className="flex flex-col items-center pb-12 pt-14 text-center transition-colors duration-300">
      <Image
        src="/buzz.png"
        alt="Georgia Tech Buzz logo"
        width={120}
        height={120}
        className="mb-4 object-contain"
      />

      <h1 className="mb-2 text-6xl font-bold text-black dark:text-white">
        Welcome to BuzzBoard
      </h1>

      <p className="mb-6 text-2xl text-gray-500 dark:text-gray-400">
        Please Sign In to Create an Event
      </p>

      <Link
        href="/login"
        className="rounded border border-black px-5 py-2 text-sm text-black transition hover:bg-gray-100 dark:border-white dark:text-white dark:hover:bg-[#222222]"
      >
        Sign In
      </Link>
    </section>
  );
}