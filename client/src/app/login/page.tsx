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
import { ensureUserDoc } from "@/lib/friendsStore";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    setError("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await ensureUserDoc(cred.user);
      router.push("/home");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await ensureUserDoc(cred.user);
      router.push("/home");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#fefcf3] px-4 transition-colors duration-300 dark:bg-[#111111]">
      <div className="liquid-bg" />

      <div className="glass-surface w-full max-w-md space-y-4 rounded-[clamp(20px,4vw,32px)] border-2 border-gray-500 p-[clamp(1.5rem,4vw,2.5rem)] dark:border-gray-500">
        <div className="flex flex-col items-center text-center">
          <Link href="/home" className="mb-4 flex items-center justify-center gap-2">
            <Image
              src="/buzz.png"
              alt="Georgia Tech Buzz mascot"
              width={44}
              height={44}
              className="object-contain drop-shadow-md"
            />
            <span className="font-logo text-3xl text-amber-600 dark:text-amber-400">
              BuzzBoard
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to your account
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white/60 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 backdrop-blur-sm transition-colors duration-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-gray-600 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-amber-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white/60 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 backdrop-blur-sm transition-colors duration-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-gray-600 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-amber-500"
          />
        </div>

        <button
          onClick={handleSignIn}
          className="w-full rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-amber-700 active:scale-[0.98] dark:bg-amber-500 dark:hover:bg-amber-600"
        >
          Sign In
        </button>

        <div className="relative flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          <span className="text-xs text-zinc-400">or</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        </div>

        <button
          onClick={handleGoogle}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white/60 py-3 text-sm font-medium text-zinc-700 backdrop-blur-sm transition-all duration-200 hover:bg-white/80 active:scale-[0.98] dark:border-gray-600 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="h-5 w-5"
          />
          Continue with Google
        </button>

        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-amber-600 hover:underline dark:text-amber-400">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
