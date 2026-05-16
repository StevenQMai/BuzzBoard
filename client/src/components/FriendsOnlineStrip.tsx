"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useFriends } from "@/hooks/useFriends";
import { statusDotClass } from "@/lib/presenceStore";
import UserAvatar from "@/components/UserAvatar";

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
          return (
            <div key={friend.uid} className="flex items-center gap-2 rounded-xl border-2 border-zinc-300 bg-amber-50 px-3 py-1.5 dark:border-zinc-600 dark:bg-zinc-800">
              <div className="relative">
                <UserAvatar photoURL={friend.photoURL} name={friend.displayName} size="h-6 w-6" />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-[1.5px] border-amber-50 dark:border-zinc-800 ${statusDotClass(friend.presence)}`}
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
