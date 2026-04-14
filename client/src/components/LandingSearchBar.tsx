"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  );
}

export default function LandingSearchBar({
  value,
  onChange,
  placeholder = "Search",
}: Props) {
  return (
    <div className="mx-auto flex w-full max-w-xl items-center gap-3">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="glass-surface h-11 flex-1 rounded-xl border-2 border-gray-400 px-4 text-sm text-black outline-none transition-colors duration-300 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
      />
      <button
        type="button"
        aria-label="Search"
        className="glass-surface inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-gray-400 text-zinc-800 transition hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-[#222222]"
      >
        <SearchIcon className="h-6 w-6" />
      </button>
    </div>
  );
}

