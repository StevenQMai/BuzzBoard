"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 transition-colors duration-300 dark:bg-[#111111]">
      <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-8 shadow-md transition-colors duration-300 dark:bg-[#1a1a1a]">
        <div className="flex flex-col items-center text-center">
          <Link href="/home" className="mb-3 flex items-center justify-center gap-2 w-full">
            <Image
              src="/buzz.png"
              alt="Georgia Tech Buzz mascot"
              width={40}
              height={40}
              className="object-contain drop-shadow-md"
            />
            <span className="font-logo logo-stroke bg-linear-to-r from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-2xl text-transparent drop-shadow-sm dark:from-amber-400 dark:via-yellow-300 dark:to-amber-400">
              BuzzBoard
            </span>
          </Link>

          <h1 className="text-3xl font-bold text-black dark:text-white">
            Sign In
          </h1>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-[#111111] dark:text-white dark:placeholder:text-gray-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-[#111111] dark:text-white dark:placeholder:text-gray-400"
        />

        <button
          onClick={handleSignIn}
          className="w-full rounded-lg bg-blue-600 py-3 text-white transition hover:bg-blue-700"
        >
          Sign In
        </button>

        <button
          onClick={handleGoogle}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 transition hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-[#222222]"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="h-5 w-5"
          />
          Continue with Google
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
