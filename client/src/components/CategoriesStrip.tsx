"use client";

const DEFAULT_CATEGORIES = [
  "All",
  "Study",
  "Hangout",
  "Workshop",
  "Career",
  "Wellness",
  "Free Food",
];

type Props = {
  categories?: string[];
  active?: string;
  onChange?: (category: string) => void;
};

export default function CategoriesStrip({
  categories = DEFAULT_CATEGORIES,
  active = "All",
  onChange,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="rounded-[28px] border-2 border-gray-400 bg-white px-4 py-3 shadow-md transition-colors duration-300 dark:border-gray-600 dark:bg-[#1a1a1a]">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((c) => {
            const isActive = c === active;
            return (
              <button
                key={c}
                type="button"
                onClick={() => onChange?.(c)}
                className={[
                  "rounded-full px-4 py-2 text-sm transition",
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "border border-gray-300 bg-transparent text-zinc-800 hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-[#222222]",
                ].join(" ")}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

