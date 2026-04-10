import { Navbar, Hero, EventGrid } from "@/components";
import AddEventButton from "@/components/AddEventButton";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f8f8] transition-colors duration-300 dark:bg-[#111111]">
      <Navbar />
      <AddEventButton />
      <Hero />
      <EventGrid />
    </main>
  );
}