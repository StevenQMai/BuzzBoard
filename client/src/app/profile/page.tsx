"use client";

import { useState } from "react";

// Example organizations – replace with API or config later
const ORGANIZATIONS = [
  { value: "", label: "Select organization" },
  { value: "gt-ieee", label: "Georgia Tech IEEE" },
  { value: "gt-acm", label: "GT ACM" },
  { value: "gt-hackers", label: "GT Hackers" },
  { value: "gt-robotics", label: "GT Robotics" },
  { value: "other", label: "Other" },
];

export default function ProfileAccountPage() {
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");

  return (
    <>
      <h2 className="mb-6 text-center text-2xl font-semibold text-black">
        Welcome to your Profile:
      </h2>

      <div className="mx-auto max-w-2xl">
        {/* Profile image placeholder */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-64 w-64 items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-100 text-center text-gray-500">
            uploaded image Here
          </div>
        </div>

        {/* User information */}
        <div className="mb-8 space-y-4 rounded border border-gray-200 bg-white p-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Name</p>
            <p className="mt-1 text-black">First Name / Last Name</p>
          </div>
          <div>
            <label htmlFor="profile-organization" className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Organization(s)
            </label>
            <select
              id="profile-organization"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm text-black outline-none focus:border-gray-400"
            >
              {ORGANIZATIONS.map((opt) => (
                <option key={opt.value || "default"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="profile-email" className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm text-black outline-none focus:border-gray-400"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            className="rounded-full border border-black px-6 py-2.5 text-sm font-medium text-black transition hover:bg-gray-100"
          >
            Change Password
          </button>
          <button
            type="button"
            className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Update Profile
          </button>
        </div>
      </div>
    </>
  );
}
