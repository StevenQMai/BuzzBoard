"use client";

const CATEGORIES = [
  "Social",
  "Sports",
  "Music",
  "Food",
  "Tech",
  "Workshop",
  "Career",
  "General",
];

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function CategoryChips({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => {
        const selected = value === cat;
        return (
          <button
            key={cat}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(selected ? "" : cat)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              selected
                ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                : "glass-surface border-gray-400 text-zinc-700 hover:border-gray-600 dark:border-gray-500 dark:text-zinc-300 dark:hover:border-gray-300"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
