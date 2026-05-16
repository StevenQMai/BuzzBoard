"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, updateProfile, sendPasswordResetEmail, type User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { setUserStatus, type UserStatus } from "@/lib/presenceStore";
import { loadScheduleFromLocalStorage } from "@/lib/scheduleStore";
import Link from "next/link";

const ORGANIZATIONS = [
  { value: "", label: "Select organization" },
  { value: "gt-ieee", label: "Georgia Tech IEEE" },
  { value: "gt-acm", label: "GT ACM" },
  { value: "gt-hackers", label: "GT Hackers" },
  { value: "gt-robotics", label: "GT Robotics" },
  { value: "other", label: "Other" },
];

const INTEREST_OPTIONS = [
  "Tech", "Design", "Networking", "Workshops", "Hackathons",
  "Social", "Sports", "Music", "Food", "Career Fair",
  "Research", "Community Service",
];

export default function ProfileAccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [organization, setOrganization] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [hasSchedule, setHasSchedule] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [currentStatus, setCurrentStatus] = useState<UserStatus>("online");
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        setDisplayName(u.displayName || "");
        loadProfileFromFirestore(u.uid);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const cached = typeof window !== "undefined" ? loadScheduleFromLocalStorage() : null;
    setHasSchedule(Boolean(cached?.length));
  }, []);

  async function loadProfileFromFirestore(uid: string) {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        const data = snap.data() as { organization?: string; bio?: string; interests?: string[]; presence?: { status?: UserStatus } };
        if (data.organization) setOrganization(data.organization);
        if (data.bio) setBio(data.bio);
        if (data.interests) setInterests(data.interests);
        if (data.presence?.status) setCurrentStatus(data.presence.status);
      }
    } catch { /* ignore */ }
  }

  async function handleStatusChange(status: UserStatus) {
    if (!user) return;
    setCurrentStatus(status);
    await setUserStatus(user.uid, status);
  }

  async function handleUpdateProfile() {
    if (!user) return;
    setSaving(true);
    setMessage(null);
    try {
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }
      await setDoc(
        doc(db, "users", user.uid),
        {
          organization,
          bio,
          interests,
          displayName: displayName || user.email?.split("@")[0] || "",
          email: user.email || "",
          photoURL: user.photoURL || null,
        },
        { merge: true },
      );
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch {
      setMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!user?.email) return;
    setMessage(null);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setMessage({ type: "success", text: `Password reset email sent to ${user.email}.` });
    } catch {
      setMessage({ type: "error", text: "Failed to send password reset email." });
    }
  }

  function toggleInterest(tag: string) {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  if (!user) return null;

  const initial = (user.displayName || user.email || "U").charAt(0).toUpperCase();

  return (
    <>
      {/* Page heading */}
      <h1 className="mb-[clamp(1rem,2.5vw,1.5rem)] text-[clamp(1.5rem,3vw,2rem)] font-bold text-zinc-900 dark:text-white">
        Edit Profile
      </h1>

      {/* Status message */}
      {message && (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
              : "border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Two-column grid */}
      <div className="grid gap-[clamp(1rem,2vw,1.5rem)] lg:grid-cols-[1fr_1fr]">
        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col gap-[clamp(1rem,2vw,1.5rem)]">
          {/* Profile photo card */}
          <div className="glass-surface overflow-hidden rounded-[clamp(16px,3vw,24px)] border-2 border-zinc-300 dark:border-zinc-600">
            {/* Colourful banner */}
            <div className="relative h-28 bg-linear-to-r from-amber-400 via-yellow-300 to-orange-400 dark:from-amber-600 dark:via-yellow-500 dark:to-orange-600">
              {/* Avatar overlapping the banner */}
              <div className="absolute -bottom-10 left-6">
                {user.photoURL && !photoError ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-md dark:border-zinc-800"
                    onError={() => setPhotoError(true)}
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-amber-100 shadow-md dark:border-zinc-800 dark:bg-amber-900">
                    <span className="text-3xl font-bold text-amber-700 dark:text-amber-300">{initial}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 pt-14 pb-5">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Your Photo</p>
              <p className="mb-3 text-[11px] text-zinc-400 dark:text-zinc-500">This will be displayed on your profile</p>
            </div>
          </div>

          {/* Personal information card */}
          <div className="glass-surface rounded-[clamp(16px,3vw,24px)] border-2 border-zinc-300 p-[clamp(1rem,3vw,1.5rem)] dark:border-zinc-600">
            <h2 className="mb-5 text-lg font-semibold text-zinc-900 dark:text-white">Personal Information</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="profile-name" className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Full Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="h-10 w-full rounded-xl border-2 border-zinc-200 bg-transparent px-3 text-sm text-zinc-900 outline-none transition focus:border-amber-400 dark:border-zinc-700 dark:text-white dark:focus:border-amber-500"
                />
              </div>

              <div>
                <label htmlFor="profile-email" className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Email Address
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={user.email || ""}
                  readOnly
                  className="h-10 w-full rounded-xl border-2 border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500 outline-none dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400"
                />
              </div>

              <div>
                <label htmlFor="profile-organization" className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Organization
                </label>
                <select
                  id="profile-organization"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="h-10 w-full rounded-xl border-2 border-zinc-200 bg-transparent px-3 text-sm text-zinc-900 outline-none transition focus:border-amber-400 dark:border-zinc-700 dark:text-white dark:focus:border-amber-500"
                >
                  {ORGANIZATIONS.map((opt) => (
                    <option key={opt.value || "default"} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleChangePassword}
              className="glass-surface h-10 rounded-xl border-2 border-zinc-300 px-5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Change Password
            </button>
            <button
              type="button"
              onClick={handleUpdateProfile}
              disabled={saving}
              className="h-10 rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex flex-col gap-[clamp(1rem,2vw,1.5rem)]">
          {/* Online Status card */}
          <div className="glass-surface rounded-[clamp(16px,3vw,24px)] border-2 border-zinc-300 p-[clamp(1rem,3vw,1.5rem)] dark:border-zinc-600">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">Online Status</h2>
            <div className="space-y-1.5">
              <StatusOption
                status="online"
                label="Online"
                description=""
                icon={<span className="h-3 w-3 rounded-full bg-emerald-500" />}
                active={currentStatus === "online"}
                onClick={() => handleStatusChange("online")}
              />
              <StatusOption
                status="idle"
                label="Idle"
                description=""
                icon={<IdleIcon />}
                active={currentStatus === "idle"}
                onClick={() => handleStatusChange("idle")}
              />
              <StatusOption
                status="dnd"
                label="Do Not Disturb"
                description="You will appear busy"
                icon={<DndIcon />}
                active={currentStatus === "dnd"}
                onClick={() => handleStatusChange("dnd")}
              />
              <StatusOption
                status="invisible"
                label="Invisible"
                description="You will appear offline"
                icon={<span className="h-3 w-3 rounded-full border-2 border-zinc-400 bg-transparent dark:border-zinc-500" />}
                active={currentStatus === "invisible"}
                onClick={() => handleStatusChange("invisible")}
              />
            </div>
          </div>

          {/* Bio card */}
          <div className="glass-surface rounded-[clamp(16px,3vw,24px)] border-2 border-zinc-300 p-[clamp(1rem,3vw,1.5rem)] dark:border-zinc-600">
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">Bio</h2>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself..."
              rows={5}
              className="w-full resize-none rounded-xl border-2 border-zinc-200 bg-transparent px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-amber-400 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-amber-500"
            />
          </div>

          {/* Interests card */}
          <div className="glass-surface rounded-[clamp(16px,3vw,24px)] border-2 border-zinc-300 p-[clamp(1rem,3vw,1.5rem)] dark:border-zinc-600">
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((tag) => {
                const selected = interests.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      selected
                        ? "border-amber-400 bg-amber-100 text-amber-800 dark:border-amber-500 dark:bg-amber-900/30 dark:text-amber-300"
                        : "border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-300"
                    }`}
                  >
                    {tag}
                    {selected && " ×"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule status card */}
          <div className="glass-surface rounded-[clamp(16px,3vw,24px)] border-2 border-zinc-300 p-[clamp(1rem,3vw,1.5rem)] dark:border-zinc-600">
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">Schedule</h2>
            {hasSchedule ? (
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">Schedule imported</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Events are prioritized based on your class times and locations.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <svg className="h-4 w-4 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">No schedule imported yet.</p>
                  <Link href="/home" className="text-xs font-medium text-amber-600 hover:underline dark:text-amber-400">
                    Import from the home page →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Account info card */}
          <div className="glass-surface rounded-[clamp(16px,3vw,24px)] border-2 border-zinc-300 p-[clamp(1rem,3vw,1.5rem)] dark:border-zinc-600">
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">Account</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Sign-in method</span>
                <span className="font-medium text-zinc-900 dark:text-white">
                  {user.providerData[0]?.providerId === "google.com" ? "Google" : "Email / Password"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">UID</span>
                <span className="max-w-[60%] truncate font-mono text-xs text-zinc-500 dark:text-zinc-400">{user.uid}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function IdleIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75 9.75 9.75 0 0 1 8.25 6 9.72 9.72 0 0 1 9 2.25c-5.385.932-9 5.738-9 10.5 0 5.799 4.701 10.5 10.5 10.5 4.762 0 9.568-3.615 10.5-9l-.248.252Z" />
    </svg>
  );
}

function DndIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm3 10.5a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5h6Z" clipRule="evenodd" />
    </svg>
  );
}

type StatusOptionProps = {
  status: UserStatus;
  label: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
};

function StatusOption({ label, description, icon, active, onClick }: StatusOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
        active
          ? "bg-zinc-100 dark:bg-zinc-800"
          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      }`}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span>
      <div className="flex-1">
        <p className={`text-sm font-medium ${active ? "text-zinc-900 dark:text-white" : "text-zinc-700 dark:text-zinc-300"}`}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">{description}</p>
        )}
      </div>
      {active && (
        <svg className="h-4 w-4 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      )}
    </button>
  );
}
