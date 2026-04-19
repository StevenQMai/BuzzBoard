"use client";

import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  subscribeEventRsvps,
  subscribeUserRsvps,
  toggleRsvp,
  type RsvpDoc,
} from "@/lib/rsvpStore";

export type UseEventRsvpReturn = {
  isRsvpd: boolean;
  rsvpCount: number;
  attendees: RsvpDoc[];
  toggle: () => Promise<void>;
  loading: boolean;
  user: User | null;
};

export function useEventRsvp(eventId: string | undefined): UseEventRsvpReturn {
  const [user, setUser] = useState<User | null>(null);
  const [attendees, setAttendees] = useState<RsvpDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimistic, setOptimistic] = useState<boolean | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!eventId) {
      setAttendees([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeEventRsvps(eventId, (rsvps) => {
      setAttendees(rsvps);
      setOptimistic(null);
      setLoading(false);
    });
    return () => unsub();
  }, [eventId]);

  const isRsvpd =
    optimistic !== null
      ? optimistic
      : !!user && attendees.some((r) => r.userId === user.uid);

  const toggle = useCallback(async () => {
    if (!user || !eventId) return;
    setOptimistic(!isRsvpd);
    await toggleRsvp(user.uid, eventId, {
      displayName: user.displayName || user.email?.split("@")[0] || "User",
      photoURL: user.photoURL || null,
    });
  }, [user, eventId, isRsvpd]);

  return {
    isRsvpd,
    rsvpCount: attendees.length,
    attendees,
    toggle,
    loading,
    user,
  };
}

export function useUserRsvps(uid: string | null): {
  rsvps: RsvpDoc[];
  loading: boolean;
} {
  const [rsvps, setRsvps] = useState<RsvpDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setRsvps([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeUserRsvps(uid, (docs) => {
      setRsvps(docs);
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  return { rsvps, loading };
}
