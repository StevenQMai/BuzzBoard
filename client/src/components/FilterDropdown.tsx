"use client";

export default function FilterDropdown() {
  return (
    <div className="absolute right-0 top-12 z-50 w-[360px] rounded-lg border border-gray-200 bg-white p-6 shadow-lg transition-colors duration-300 dark:border-gray-700 dark:bg-[#1a1a1a]">
      <h2 className="mb-4 text-lg font-semibold text-gray-700 dark:text-white">
        Filters
      </h2>

      <div className="space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <label className="text-gray-700 dark:text-gray-300">Major:</label>
          <select className="w-40 rounded border border-gray-300 bg-white px-3 py-1 text-black dark:border-gray-600 dark:bg-[#111111] dark:text-white">
            <option>Select</option>
            <option>Computer Science</option>
            <option>Business</option>
            <option>Biology</option>
            <option>Mechanical Engineering</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-gray-700 dark:text-gray-300">Degree:</label>
          <select className="w-40 rounded border border-gray-300 bg-white px-3 py-1 text-black dark:border-gray-600 dark:bg-[#111111] dark:text-white">
            <option>Select</option>
            <option>Bachelor&apos;s</option>
            <option>Master&apos;s</option>
            <option>PhD</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-gray-700 dark:text-gray-300">
            Clubs/Organizations:
          </label>
          <select className="w-40 rounded border border-gray-300 bg-white px-3 py-1 text-black dark:border-gray-600 dark:bg-[#111111] dark:text-white">
            <option>Select</option>
            <option>AI@GT</option>
            <option>VGDev</option>
            <option>Web Dev Club</option>
            <option>NSBE</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-gray-700 dark:text-gray-300">Career:</label>
          <select className="w-40 rounded border border-gray-300 bg-white px-3 py-1 text-black dark:border-gray-600 dark:bg-[#111111] dark:text-white">
            <option>Select</option>
            <option>Career Fair</option>
            <option>Job Fair</option>
            <option>Meet and Greet</option>
            <option>Presentation</option>
          </select>
        </div>

        <div className="space-y-3 pt-2 text-gray-700 dark:text-gray-300">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4" />
            Wellness
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4" />
            Workshops
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4" />
            Graduation
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4" />
            Free Food
          </label>
        </div>

        <div className="pt-3">
          <label className="mb-2 block text-gray-700 dark:text-gray-300">
            Date:
          </label>
          <input
            type="date"
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-black dark:border-gray-600 dark:bg-[#111111] dark:text-white"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button className="rounded border border-gray-300 px-4 py-2 text-sm transition hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-[#222222]">
            Clear
          </button>
          <button className="rounded bg-black px-4 py-2 text-sm text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}