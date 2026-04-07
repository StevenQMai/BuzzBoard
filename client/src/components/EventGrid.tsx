import EventCard from './EventCard';
import { fetchEvents } from '@/lib/utils';

export default async function EventGrid() {
  let events;

  try {
    events = await fetchEvents();
  } catch {
    return (
      <section className="px-6 pb-16 lg:px-8">
        <p className="text-center text-gray-400 py-16">Could not load events. Make sure the server is running.</p>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className="px-6 pb-16 lg:px-8">
        <p className="text-center text-gray-400 py-16">No events found.</p>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-8 px-6 pb-16 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
      {events.map((event) => (
        <EventCard
          key={event.id}
          title={event.title}
          type={event.type}
          date={event.date}
          time={event.time}
          location={event.location}
          imageUrl={event.imageUrl}
        />
      ))}
    </section>
  );
}
