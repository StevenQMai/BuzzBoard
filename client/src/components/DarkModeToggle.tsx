"use client";

import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    document.documentElement.classList.toggle("dark", shouldUseDark);
    setDarkMode(shouldUseDark);
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    document.documentElement.classList.toggle("dark", nextMode);
    localStorage.setItem("theme", nextMode ? "dark" : "light");
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleDarkMode}
      className="rounded-xl border-2 border-gray-400 px-4 py-2 text-sm transition hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-[#222222]"
    >
      {darkMode ? "Light Mode" : "Dark Mode"}
    </button>
  );
}