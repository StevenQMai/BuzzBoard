"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Navbar } from "@/components";
import UserAvatar from "@/components/UserAvatar";

const sidebarSections = [
  {
    heading: "Profile",
    links: [
      { label: "Account Information", href: "/profile", icon: "user" },
    ],
  },
  {
    heading: "Social",
    links: [
      { label: "Friends", href: "/profile/friends", icon: "friends" },
    ],
  },
  {
    heading: "Events",
    links: [
      { label: "Events Created", href: "/profile/events-created", icon: "calendar" },
      { label: "Events Reserved", href: "/profile/events-reserved", icon: "ticket" },
    ],
  },
  {
    heading: "Navigation",
    links: [
      { label: "Home Feed", href: "/home", icon: "home" },
      { label: "Campus Map", href: "/map", icon: "map" },
    ],
  },
];

function SidebarIcon({ name, className }: { name: string; className?: string }) {
  const cn = className || "h-4 w-4";
  switch (name) {
    case "user":
      return (
        <svg className={cn} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      );
    case "calendar":
      return (
        <svg className={cn} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
      );
    case "ticket":
      return (
        <svg className={cn} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
        </svg>
      );
    case "home":
      return (
        <svg className={cn} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      );
    case "map":
      return (
        <svg className={cn} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
      );
    case "friends":
      return (
        <svg className={cn} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    default:
      return null;
  }
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setReady(true);
      if (!u) router.push("/login");
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!ready) return null;
  if (!user) return null;

  const initial = (user.displayName || user.email || "U").charAt(0).toUpperCase();
  const displayName = user.displayName || user.email?.split("@")[0] || "User";

  const sidebarContent = (
    <>
      {/* User identity block */}
      <div className="mb-6 flex items-center gap-3 px-1">
        <UserAvatar photoURL={user.photoURL} name={user.displayName || user.email} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{displayName}</p>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{user.email}</p>
        </div>
      </div>

      <div className="mb-2 border-b border-zinc-200 dark:border-zinc-700" />

      {/* Nav sections */}
      <nav className="flex flex-1 flex-col gap-5 py-2">
        {sidebarSections.map((section) => (
          <div key={section.heading}>
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {section.heading}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.links.map(({ label, href, icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition ${
                      isActive
                        ? "bg-amber-100/70 font-medium text-zinc-900 dark:bg-amber-500/20 dark:text-amber-300"
                        : "text-zinc-600 hover:bg-amber-50/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
                    }`}
                  >
                    <SidebarIcon name={icon} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="mt-auto border-t border-zinc-200 pt-3 dark:border-zinc-700">
        <button
          type="button"
          onClick={() => signOut(auth)}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-500 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
          </svg>
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#fefcf3] transition-colors duration-300 dark:bg-[#111111]">
      <Navbar showSearch={false} />

      <div className="mx-auto flex w-full max-w-[92%] gap-[clamp(1rem,2vw,1.5rem)] px-[clamp(1rem,3vw,2rem)] pt-[clamp(1rem,2vw,1.5rem)]">
        {/* Desktop sidebar */}
        <aside className="glass-surface sticky top-24 hidden w-60 shrink-0 flex-col self-start rounded-[clamp(16px,3vw,24px)] border-2 border-zinc-300 p-4 dark:border-zinc-600 lg:flex" style={{ maxHeight: "calc(100vh - 7rem)" }}>
          {sidebarContent}
        </aside>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="glass-surface fixed bottom-6 left-6 z-50 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-zinc-300 shadow-lg dark:border-zinc-600 lg:hidden"
          aria-label="Toggle menu"
        >
          <svg className="h-5 w-5 text-zinc-700 dark:text-zinc-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setMobileOpen(false)} />
            <aside className="glass-surface fixed top-0 left-0 z-50 flex h-full w-72 flex-col rounded-r-3xl border-r-2 border-zinc-300 p-5 dark:border-zinc-600 lg:hidden">
              {sidebarContent}
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="min-w-0 flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
