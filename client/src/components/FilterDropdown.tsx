"use client";

export default function FilterDropdown() {
  return (
    <div className="absolute right-0 top-12 z-50 w-[360px] rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-lg font-semibold text-gray-700">Filters</h2>

      <div className="space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <label className="text-gray-700">Major:</label>
          <select className="w-40 rounded border border-gray-300 px-3 py-1">
            <option>Select</option>
            <option>Computer Science</option>
            <option>Business</option>
            <option>Biology</option>
            <option>Mechanical Engineering</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-gray-700">Degree:</label>
          <select className="w-40 rounded border border-gray-300 px-3 py-1">
            <option>Select</option>
            <option>Bachelor&apos;s</option>
            <option>Master&apos;s</option>
            <option>PhD</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-gray-700">Clubs/Organizations:</label>
          <select className="w-40 rounded border border-gray-300 px-3 py-1">
            <option>Select</option>
            <option>AI@GT</option>
            <option>VGDev</option>
            <option>Web Dev Club</option>
            <option>NSBE</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-gray-700">Career:</label>
          <select className="w-40 rounded border border-gray-300 px-3 py-1">
            <option>Select</option>
            <option>Career Fair</option>
            <option>Job Fair</option>
            <option>Meet and Greet</option>
            <option>Presentation</option>
          </select>
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-center gap-2 text-gray-700">
            <input type="checkbox" className="h-4 w-4" />
            Wellness
          </label>

          <label className="flex items-center gap-2 text-gray-700">
            <input type="checkbox" className="h-4 w-4" />
            Workshops
          </label>

          <label className="flex items-center gap-2 text-gray-700">
            <input type="checkbox" className="h-4 w-4" />
            Graduation
          </label>

          <label className="flex items-center gap-2 text-gray-700">
            <input type="checkbox" className="h-4 w-4" />
            Free Food
          </label>
        </div>

        <div className="pt-3">
          <label className="mb-2 block text-gray-700">Date:</label>
          <input
            type="date"
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button className="rounded border border-gray-300 px-4 py-2 text-sm transition hover:bg-gray-100">
            Clear
          </button>
          <button className="rounded bg-black px-4 py-2 text-sm text-white transition hover:bg-gray-800">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}