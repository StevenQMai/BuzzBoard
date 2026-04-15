export default function EventsReservedPage() {
  return (
    <>
      <h2 className="mb-[clamp(1rem,3vw,2rem)] text-[clamp(1.25rem,3vw,1.75rem)] font-semibold text-zinc-900 dark:text-white">
        Events Reserved
      </h2>

      <div className="glass-surface flex flex-col items-center justify-center rounded-[clamp(16px,3vw,24px)] border-2 border-gray-500 px-6 py-20 text-center dark:border-gray-500">
        <div className="mb-4 text-5xl">🎟️</div>
        <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
          Coming Soon
        </h3>
        <p className="max-w-md text-sm text-zinc-500 dark:text-zinc-400">
          Once you RSVP to events, they&apos;ll show up here so you can keep track of
          everything you&apos;ve signed up for.
        </p>
      </div>
    </>
  );
}
