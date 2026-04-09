type EventCardProps = {
  title: string;
};

export default function EventCard({ title }: EventCardProps) {
  return (
    <div className="w-full rounded border border-gray-200 bg-white p-4 transition-colors duration-300 dark:border-gray-700 dark:bg-[#1a1a1a]">
      <div className="mb-4 h-40 rounded bg-gray-100 transition-colors duration-300 dark:bg-[#2a2a2a]" />

      <h3 className="mb-5 text-center text-2xl text-black dark:text-white">
        {title}
      </h3>

      <div className="flex justify-center">
        <button className="rounded bg-gray-100 px-3 py-1 text-sm text-black transition hover:bg-gray-200 dark:bg-[#2a2a2a] dark:text-white dark:hover:bg-[#333333]">
          Explore
        </button>
      </div>
    </div>
  );
}