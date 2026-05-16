"use client";

import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useFriends, type FriendPresence, type FriendRequest } from "@/hooks/useFriends";
import { statusDotClass } from "@/lib/presenceStore";
import {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  type UserSearchResult,
} from "@/lib/friendsStore";
import UserAvatar from "@/components/UserAvatar";

type Props = {
  open: boolean;
  onClose: () => void;
};

function StatusDot({ presence }: { presence: FriendPresence["presence"] }) {
  return (
    <span
      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-800 ${statusDotClass(presence)}`}
    />
  );
}

function LocationBadge({ presence }: { presence: FriendPresence["presence"] }) {
  if (!presence?.isOnline) return null;

  if (presence.buildingKey) {
    return (
      <span className="shrink-0 rounded-lg bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
        <svg className="mr-0.5 inline-block h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
        {presence.buildingLabel}
      </span>
    );
  }

  return (
    <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
      Off campus
    </span>
  );
}

export default function FriendsSidebar({ open, onClose }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const { friends, pendingRequests, outgoingRequests, loading } = useFriends(user?.uid ?? null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const results = await searchUsers(searchQuery);
      setSearchResults(results.filter((r) => r.uid !== user?.uid));
      setSearching(false);
    }, 400);
  }, [searchQuery, user?.uid]);

  async function handleSendRequest(toUid: string) {
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

  async function handleCancel(req: FriendRequest) {
    await cancelFriendRequest(req.id);
    setSentTo((prev) => {
      const next = new Set(prev);
      next.delete(req.to);
      return next;
    });
  }

  async function handleRemove(friendUid: string) {
    if (!user) return;
    await removeFriend(user.uid, friendUid);
  }

  const friendUids = new Set(friends.map((f) => f.uid));
  const outgoingToUids = new Set(outgoingRequests.map((r) => r.to));

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={onClose} />
      )}

      <aside
        className={`glass-surface fixed top-0 right-0 z-50 flex h-full w-80 flex-col border-l-2 border-zinc-300 transition-transform duration-300 dark:border-zinc-600 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-zinc-300 px-5 py-4 dark:border-zinc-600">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Friends</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="border-b-2 border-zinc-300 px-5 py-3 dark:border-zinc-600">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="h-9 w-full rounded-xl border-2 border-zinc-300 bg-transparent px-3 text-sm text-zinc-900 outline-none transition focus:border-amber-400 dark:border-zinc-600 dark:text-white dark:focus:border-amber-500"
          />

          {searchQuery.trim() && (
            <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
              {searching ? (
                <p className="py-2 text-center text-xs text-zinc-400">Searching...</p>
              ) : searchResults.length === 0 ? (
                <p className="py-2 text-center text-xs text-zinc-400">No users found</p>
              ) : (
                searchResults.map((r) => {
                  const isFriend = friendUids.has(r.uid);
                  const isSent = sentTo.has(r.uid) || outgoingToUids.has(r.uid);
                  return (
                    <div key={r.uid} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/50">
                      <UserAvatar photoURL={r.photoURL} name={r.displayName} size="h-8 w-8" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{r.displayName}</p>
                        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{r.email}</p>
                      </div>
                      {isFriend ? (
                        <span className="shrink-0 text-xs text-emerald-600 dark:text-emerald-400">Friends</span>
                      ) : isSent ? (
                        <span className="shrink-0 text-xs text-zinc-400">Sent</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendRequest(r.uid)}
                          className="shrink-0 rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500"
                        >
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

        <div className="flex-1 overflow-y-auto">
          {/* Incoming requests */}
          {pendingRequests.length > 0 && (
            <div className="border-b-2 border-zinc-300 px-5 py-3 dark:border-zinc-600">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Incoming ({pendingRequests.length})
              </p>
              <div className="space-y-2">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="flex items-center gap-3">
                    <UserAvatar photoURL={req.fromPhoto} name={req.fromName} size="h-8 w-8" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{req.fromName}</p>
                      <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{req.fromEmail}</p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAccept(req)}
                        className="rounded-lg bg-emerald-500 px-2 py-1 text-xs font-semibold text-white transition hover:bg-emerald-600"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(req)}
                        className="rounded-lg border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outgoing requests */}
          {outgoingRequests.length > 0 && (
            <div className="border-b-2 border-zinc-300 px-5 py-3 dark:border-zinc-600">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Sent ({outgoingRequests.length})
              </p>
              <div className="space-y-2">
                {outgoingRequests.map((req) => (
                  <div key={req.id} className="flex items-center gap-3">
                    <UserAvatar photoURL={req.toPhoto} name={req.toName} size="h-8 w-8" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{req.toName}</p>
                      <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{req.toEmail}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCancel(req)}
                      className="shrink-0 rounded-lg border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends list */}
          <div className="px-5 py-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Friends ({friends.length})
            </p>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
              </div>
            ) : friends.length === 0 ? (
              <p className="py-6 text-center text-sm text-zinc-400 dark:text-zinc-500">
                No friends yet. Search to add someone!
              </p>
            ) : (
              <div className="space-y-1">
                {friends.map((friend) => (
                  <FriendRow
                    key={friend.uid}
                    friend={friend}
                    onRemove={() => handleRemove(friend.uid)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function FriendRow({ friend, onRemove }: { friend: FriendPresence; onRemove: () => void }) {
  const [showMenu, setShowMenu] = useState(false);
  const isOnline = friend.presence?.isOnline ?? false;

  function locationSubtitle() {
    if (!isOnline) return "Offline";
    if (friend.presence?.buildingKey) return friend.presence.buildingLabel;
    return "Off campus";
  }

  return (
    <div className="group relative flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-zinc-100 dark:hover:bg-zinc-800/50">
      <div className="relative">
        <UserAvatar photoURL={friend.photoURL} name={friend.displayName} />
        <StatusDot presence={friend.presence} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
          {friend.displayName || "Loading…"}
        </p>
        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{locationSubtitle()}</p>
      </div>

      <LocationBadge presence={friend.presence} />

      {/* More menu */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 opacity-0 transition group-hover:opacity-100 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          aria-label="More options"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM10 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM10 18a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
          </svg>
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 z-20 mt-1 w-36 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => { onRemove(); setShowMenu(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Remove
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
