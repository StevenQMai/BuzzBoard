"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ensureUserDoc } from "@/lib/friendsStore";
import Image from "next/image";

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`.trim(),
        photoURL: profilePicture || "",
      });
      await ensureUserDoc(userCredential.user);
      router.push("/home");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#fefcf3] px-4 py-8 transition-colors duration-300 dark:bg-[#111111]">
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
            Create an account
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Join BuzzBoard to discover campus events
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white/60 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 backdrop-blur-sm transition-colors duration-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-gray-600 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-amber-500"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white/60 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 backdrop-blur-sm transition-colors duration-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-gray-600 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-amber-500"
            />
          </div>
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
          <input
            type="text"
            placeholder="Profile Picture URL (optional)"
            value={profilePicture}
            onChange={(e) => setProfilePicture(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white/60 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 backdrop-blur-sm transition-colors duration-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-gray-600 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-amber-500"
          />
        </div>

        <button
          onClick={handleSignUp}
          className="w-full rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-amber-700 active:scale-[0.98] dark:bg-amber-500 dark:hover:bg-amber-600"
        >
          Create Account
        </button>

        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-amber-600 hover:underline dark:text-amber-400">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
