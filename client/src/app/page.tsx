import { Navbar, Hero, EventGrid } from "@/components";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f8f8]">
      <Navbar />
      <Hero />
      <EventGrid />
    </main>
  );
}