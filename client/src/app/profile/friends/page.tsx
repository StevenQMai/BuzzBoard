"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useFriends, type FriendPresence, type FriendRequest } from "@/hooks/useFriends";
import {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  type UserSearchResult,
} from "@/lib/friendsStore";
import Link from "next/link";

function Avatar({ photoURL, name, size = "h-10 w-10" }: { photoURL: string | null; name: string; size?: string }) {
  const initial = (name || "U").charAt(0).toUpperCase();
  return photoURL ? (
    <img src={photoURL} alt="" className={`${size} shrink-0 rounded-full object-cover`} />
  ) : (
    <span className={`${size} flex shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700 dark:bg-amber-900 dark:text-amber-300`}>
      {initial}
    </span>
  );
}

export default function FriendsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const { friends, pendingRequests, loading } = useFriends(user?.uid ?? null);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    setSearching(true);
    const timeout = setTimeout(async () => {
      const results = await searchUsers(searchQuery);
      setSearchResults(results.filter((r) => r.uid !== user?.uid));
      setSearching(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchQuery, user?.uid]);

  const friendUids = new Set(friends.map((f) => f.uid));

  async function handleSend(toUid: string) {
    if (!user) return;
    await sendFriendRequest(user, toUid);
    setSentTo((prev) => new Set(prev).add(toUid));
  }

  async function handleAccept(req: FriendRequest) {
    await acceptFriendRequest(req.id, req.from, req.to);
  }

  async function handleReject(req: FriendRequest) {
    await rejectFriendRequest(req.id);
  }

  async function handleRemove(friendUid: string) {
    if (!user) return;
    await removeFriend(user.uid, friendUid);
  }

  if (!user) return null;

  return (
    <>
      <h1 className="mb-[clamp(1rem,2.5vw,1.5rem)] text-[clamp(1.5rem,3vw,2rem)] font-bold text-zinc-900 dark:text-white">
        Friends
      </h1>

      {/* Search */}
      <div className="glass-surface mb-[clamp(1rem,2vw,1.5rem)] rounded-[clamp(16px,3vw,24px)] border-2 border-zinc-300 p-[clamp(1rem,3vw,1.5rem)] dark:border-zinc-600">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">Add Friends</h2>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="h-10 w-full rounded-xl border-2 border-zinc-200 bg-transparent px-3 text-sm text-zinc-900 outline-none transition focus:border-amber-400 dark:border-zinc-700 dark:text-white dark:focus:border-amber-500"
        />

        {searchQuery.trim() && (
          <div className="mt-3 max-h-60 space-y-1 overflow-y-auto">
            {searching ? (
              <p className="py-3 text-center text-xs text-zinc-400">Searching...</p>
            ) : searchResults.length === 0 ? (
              <p className="py-3 text-center text-xs text-zinc-400">No users found</p>
            ) : (
              searchResults.map((r) => {
                const isFriend = friendUids.has(r.uid);
                const isSent = sentTo.has(r.uid);
                return (
                  <div key={r.uid} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/50">
                    <Avatar photoURL={r.photoURL} name={r.displayName} size="h-9 w-9" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{r.displayName}</p>
                      <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{r.email}</p>
                    </div>
                    {isFriend ? (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">Friends</span>
                    ) : isSent ? (
                      <span className="text-xs text-zinc-400">Sent</span>
                    ) : (
                      <button type="button" onClick={() => handleSend(r.uid)} className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600">
                        Add
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Pending requests */}
      {pendingRequests.length > 0 && (
        <div className="glass-surface mb-[clamp(1rem,2vw,1.5rem)] rounded-[clamp(16px,3vw,24px)] border-2 border-zinc-300 p-[clamp(1rem,3vw,1.5rem)] dark:border-zinc-600">
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">
            Pending Requests ({pendingRequests.length})
          </h2>
          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <div key={req.id} className="flex items-center gap-3 rounded-xl px-2 py-2">
                <Avatar photoURL={req.fromPhoto} name={req.fromName} size="h-9 w-9" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{req.fromName}</p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{req.fromEmail}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleAccept(req)} className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-600">
                    Accept
                  </button>
                  <button type="button" onClick={() => handleReject(req)} className="rounded-lg border border-zinc-300 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends list */}
      <div className="glass-surface rounded-[clamp(16px,3vw,24px)] border-2 border-zinc-300 p-[clamp(1rem,3vw,1.5rem)] dark:border-zinc-600">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">
          Your Friends ({friends.length})
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
          </div>
        ) : friends.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-400 dark:text-zinc-500">
            No friends yet. Use the search above to add someone!
          </p>
        ) : (
          <div className="space-y-1">
            {friends.map((friend) => (
              <FriendRow key={friend.uid} friend={friend} onRemove={() => handleRemove(friend.uid)} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        <Link href="/map" className="text-sm font-medium text-amber-600 hover:underline dark:text-amber-400">
          See friends on the campus map →
        </Link>
      </div>
    </>
  );
}

function FriendRow({ friend, onRemove }: { friend: FriendPresence; onRemove: () => void }) {
  const isOnline = friend.presence?.isOnline ?? false;
  const building = friend.presence?.buildingLabel || "";

  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-zinc-100 dark:hover:bg-zinc-800/50">
      <div className="relative">
        <Avatar photoURL={friend.photoURL} name={friend.displayName} />
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-800 ${
            isOnline ? "bg-emerald-500" : "bg-zinc-400"
          }`}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{friend.displayName}</p>
        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
          {isOnline ? (building || "Online") : "Offline"}
        </p>
      </div>
      {isOnline && building && (
        <span className="shrink-0 rounded-lg bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          {building}
        </span>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded-lg px-2 py-1 text-xs text-red-500 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
      >
        Remove
      </button>
    </div>
  );
}
