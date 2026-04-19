"use client";

import { useEffect, useState, useRef } from "react";
import {
  subscribeFriends,
  subscribeFriendRequests,
  subscribeOutgoingRequests,
  type FriendDoc,
  type FriendRequest,
} from "@/lib/friendsStore";
import { subscribePresence, type FriendPresence } from "@/lib/presenceStore";

export type { FriendPresence } from "@/lib/presenceStore";
export type { FriendRequest } from "@/lib/friendsStore";

export type UseFriendsReturn = {
  friends: FriendPresence[];
  pendingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  loading: boolean;
};

export function useFriends(uid: string | null): UseFriendsReturn {
  const [friendDocs, setFriendDocs] = useState<FriendDoc[]>([]);
  const [presenceMap, setPresenceMap] = useState<Map<string, FriendPresence>>(new Map());
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
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

    const unsubOutgoing = subscribeOutgoingRequests(uid, (reqs) => {
      setOutgoingRequests(reqs);
    });

    return () => {
      unsubFriends();
      unsubRequests();
      unsubOutgoing();
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
    .map(
      (fd): FriendPresence =>
        presenceMap.get(fd.uid) ?? {
          uid: fd.uid,
          displayName: "",
          email: "",
          photoURL: null,
          presence: null,
        },
    )
    .sort((a, b) => {
      const aOnline = a.presence?.isOnline ? 1 : 0;
      const bOnline = b.presence?.isOnline ? 1 : 0;
      if (bOnline !== aOnline) return bOnline - aOnline;
      return a.displayName.localeCompare(b.displayName);
    });

  return { friends, pendingRequests, outgoingRequests, loading };
}
