import EventCard from "./EventCard";

const events = [
  "Grad Fest 2026",
  "Wellness Event",
  "Meet an Alumni",
  "VGDev Demo Day",
  "Free Food",
  "AI@GT Seminar",
  "WebDev Demo",
  "Tennis Match",
];

export default function EventGrid() {
  return (
    <section className="grid grid-cols-1 gap-8 px-6 pb-16 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
      {events.map((event, index) => (
        <EventCard key={index} title={event} />
      ))}
    </section>
  );
}