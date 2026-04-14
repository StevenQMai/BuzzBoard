"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarLinks = [
  { label: "Account Information", href: "/profile" },
  { label: "Events Created", href: "/profile/events-created" },
  { label: "Events Reserved", href: "/profile/events-reserved" },
];

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Header bar – same logo and UI as main Navbar */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90">
          <Image
            src="/buzz.png"
            alt="Georgia Tech Buzz mascot"
            width={40}
            height={40}
            className="object-contain drop-shadow-md"
          />
          <span className="font-logo logo-stroke bg-linear-to-r from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-3xl text-transparent drop-shadow-sm dark:from-amber-400 dark:via-yellow-300 dark:to-amber-400">
            BuzzBoard
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-center gap-3 px-8">
          <input
            type="text"
            placeholder="Search"
            className="w-72 rounded border border-gray-200 px-4 py-2 text-sm outline-none"
          />
          <button
            type="button"
            className="rounded px-3 py-2 text-sm transition hover:bg-gray-100"
            aria-label="Search"
          >
            ⌕
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="rounded p-2 text-gray-600 transition hover:bg-gray-100"
            aria-label="Notifications"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button
            type="button"
            className="rounded p-2 text-gray-600 transition hover:bg-gray-100"
            aria-label="Help"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-xs font-medium">i</span>
          </button>
          <button
            type="button"
            className="rounded-full p-1 text-gray-600 transition hover:bg-gray-100"
            aria-label="More"
          >
            <span className="block h-5 w-5 rounded-full bg-gray-300" />
          </button>
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm font-medium text-black">First Last</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200">
              <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left navigation sidebar */}
        <aside className="w-56 shrink-0 border-r border-gray-200 bg-white p-4">
          <Link
            href="/"
            className="mb-6 flex items-center gap-2 text-sm text-gray-600 transition hover:text-black"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            return
          </Link>
          <nav className="flex flex-col gap-1">
            {sidebarLinks.map(({ label, href }) => {
              const isActive = pathname === href || (href === "/profile" && pathname === "/profile");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded px-3 py-2.5 text-sm transition ${
                    isActive
                      ? "bg-gray-100 font-medium text-black"
                      : "text-gray-600 hover:bg-gray-50 hover:text-black"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content area */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
