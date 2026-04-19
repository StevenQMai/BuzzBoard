"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useFriends } from "@/hooks/useFriends";
import { statusDotClass } from "@/lib/presenceStore";

function statusLabel(presence: { isOnline: boolean; status?: string; buildingLabel?: string } | null | undefined): string {
  if (!presence?.isOnline) return "Offline";
  if (presence.buildingLabel && presence.buildingLabel !== "Off campus") return presence.buildingLabel;
  return presence.buildingLabel === "Off campus" ? "Off campus" : "Online";
}

export default function FriendsOnlineStrip() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  const { friends, loading } = useFriends(user?.uid ?? null);

  if (!user || loading) return null;

  const onlineFriends = friends.filter((f) => f.presence?.isOnline);

  if (onlineFriends.length === 0) return null;

  return (
    <div className="mb-[clamp(1rem,2vw,1.5rem)]">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        Friends Online — {onlineFriends.length}
      </p>
      <div className="flex flex-wrap gap-3">
        {onlineFriends.map((friend) => {
          const initial = (friend.displayName || "U").charAt(0).toUpperCase();
          return (
            <div key={friend.uid} className="flex items-center gap-2 rounded-xl bg-zinc-100/60 px-3 py-1.5 dark:bg-zinc-800/60">
              <div className="relative">
                {friend.photoURL ? (
                  <img src={friend.photoURL} alt="" className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                    {initial}
                  </span>
                )}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-[1.5px] border-white dark:border-zinc-800 ${statusDotClass(friend.presence)}`}
                />
              </div>
              <div>
                <p className="text-xs font-medium leading-tight text-zinc-800 dark:text-zinc-200">{friend.displayName}</p>
                <p className="text-[10px] leading-tight text-zinc-400 dark:text-zinc-500">{statusLabel(friend.presence)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
