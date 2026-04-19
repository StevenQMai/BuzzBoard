import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User } from "firebase/auth";

export type FriendRequest = {
  id: string;
  from: string;
  to: string;
  fromName: string;
  fromEmail: string;
  fromPhoto: string | null;
  toName: string;
  toEmail: string;
  toPhoto: string | null;
  status: "pending" | "accepted" | "rejected";
  createdAt: unknown;
};

export type FriendDoc = {
  uid: string;
  addedAt: unknown;
};

export type UserSearchResult = {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
};

export async function sendFriendRequest(fromUser: User, toUid: string): Promise<void> {
  const existing = await getDocs(
    query(
      collection(db, "friendRequests"),
      where("from", "==", fromUser.uid),
      where("to", "==", toUid),
      where("status", "==", "pending"),
    ),
  );
  if (!existing.empty) return;

  const reverse = await getDocs(
    query(
      collection(db, "friendRequests"),
      where("from", "==", toUid),
      where("to", "==", fromUser.uid),
      where("status", "==", "pending"),
    ),
  );
  if (!reverse.empty) return;

  const toSnap = await getDoc(doc(db, "users", toUid));
  const toData = toSnap.data() as { displayName?: string; email?: string; photoURL?: string } | undefined;

  await addDoc(collection(db, "friendRequests"), {
    from: fromUser.uid,
    to: toUid,
    fromName: fromUser.displayName || fromUser.email?.split("@")[0] || "User",
    fromEmail: fromUser.email || "",
    fromPhoto: fromUser.photoURL || null,
    toName: toData?.displayName || toData?.email?.split("@")[0] || "User",
    toEmail: toData?.email || "",
    toPhoto: toData?.photoURL || null,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

export async function acceptFriendRequest(
  requestId: string,
  fromUid: string,
  toUid: string,
): Promise<void> {
  await updateDoc(doc(db, "friendRequests", requestId), { status: "accepted" });
  await setDoc(doc(db, "users", toUid, "friends", fromUid), { addedAt: serverTimestamp() });
  await setDoc(doc(db, "users", fromUid, "friends", toUid), { addedAt: serverTimestamp() });
}

export async function rejectFriendRequest(requestId: string): Promise<void> {
  await updateDoc(doc(db, "friendRequests", requestId), { status: "rejected" });
}

export async function removeFriend(uid: string, friendUid: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "friends", friendUid));
  await deleteDoc(doc(db, "users", friendUid, "friends", uid));
}

export async function ensureUserDoc(user: User): Promise<void> {
  const ref = doc(db, "users", user.uid);
  await setDoc(
    ref,
    {
      displayName: user.displayName || user.email?.split("@")[0] || "User",
      email: user.email || "",
      photoURL: user.photoURL || null,
    },
    { merge: true },
  );
}

export async function searchUsers(queryStr: string): Promise<UserSearchResult[]> {
  const q = queryStr.trim().toLowerCase();
  if (!q) return [];

  const snap = await getDocs(collection(db, "users"));
  const results: UserSearchResult[] = [];

  snap.forEach((d) => {
    const data = d.data() as { displayName?: string; email?: string; photoURL?: string };
    const name = (data.displayName || "").toLowerCase();
    const email = (data.email || "").toLowerCase();
    if (name.includes(q) || email.includes(q)) {
      results.push({
        uid: d.id,
        displayName: data.displayName || email.split("@")[0] || "User",
        email: data.email || "",
        photoURL: data.photoURL || null,
      });
    }
  });

  return results;
}

export function subscribeFriends(
  uid: string,
  callback: (friends: FriendDoc[]) => void,
): Unsubscribe {
  return onSnapshot(collection(db, "users", uid, "friends"), (snap) => {
    const friends: FriendDoc[] = [];
    snap.forEach((d) => friends.push({ uid: d.id, addedAt: d.data().addedAt }));
    callback(friends);
  });
}

export function subscribeFriendRequests(
  uid: string,
  callback: (requests: FriendRequest[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, "friendRequests"),
    where("to", "==", uid),
    where("status", "==", "pending"),
  );
  return onSnapshot(q, (snap) => {
    const requests: FriendRequest[] = [];
    snap.forEach((d) => requests.push({ id: d.id, ...d.data() } as FriendRequest));
    callback(requests);
  });
}

export function subscribeOutgoingRequests(
  uid: string,
  callback: (requests: FriendRequest[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, "friendRequests"),
    where("from", "==", uid),
    where("status", "==", "pending"),
  );
  return onSnapshot(q, (snap) => {
    const requests: FriendRequest[] = [];
    snap.forEach((d) => requests.push({ id: d.id, ...d.data() } as FriendRequest));
    callback(requests);
  });
}

export async function cancelFriendRequest(requestId: string): Promise<void> {
  await deleteDoc(doc(db, "friendRequests", requestId));
}
