"use client";

import { useEffect, useState, useRef } from "react";
import {
  subscribeFriends,
  subscribeFriendRequests,
  type FriendDoc,
  type FriendRequest,
} from "@/lib/friendsStore";
import { subscribePresence, type FriendPresence } from "@/lib/presenceStore";

export type { FriendPresence } from "@/lib/presenceStore";
export type { FriendRequest } from "@/lib/friendsStore";

export type UseFriendsReturn = {
  friends: FriendPresence[];
  pendingRequests: FriendRequest[];
  loading: boolean;
};

export function useFriends(uid: string | null): UseFriendsReturn {
  const [friendDocs, setFriendDocs] = useState<FriendDoc[]>([]);
  const [presenceMap, setPresenceMap] = useState<Map<string, FriendPresence>>(new Map());
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const presenceUnsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const unsubFriends = subscribeFriends(uid, (docs) => {
      setFriendDocs(docs);
      setLoading(false);
    });

    const unsubRequests = subscribeFriendRequests(uid, (reqs) => {
      setPendingRequests(reqs);
    });

    return () => {
      unsubFriends();
      unsubRequests();
    };
  }, [uid]);

  useEffect(() => {
    presenceUnsubRef.current?.();
    presenceUnsubRef.current = null;

    const uids = friendDocs.map((f) => f.uid);
    if (uids.length === 0) {
      setPresenceMap(new Map());
      return;
    }

    presenceUnsubRef.current = subscribePresence(uids, (map) => {
      setPresenceMap(map);
    });

    return () => {
      presenceUnsubRef.current?.();
      presenceUnsubRef.current = null;
    };
  }, [friendDocs]);

  const friends: FriendPresence[] = friendDocs
    .map((fd) => presenceMap.get(fd.uid))
    .filter(Boolean) as FriendPresence[];

  return { friends, pendingRequests, loading };
}
