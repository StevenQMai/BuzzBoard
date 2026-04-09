import Image from "next/image";

export default function Hero() {
  return (
    <section className="flex flex-col items-center pt-14 pb-12 text-center">
      <Image
        src="/buzz.png"
        alt="Georgia Tech Buzz logo"
        width={120}
        height={120}
        className="mb-4 object-contain"
      />

      <h1 className="mb-2 text-6xl font-bold text-black">
        Welcome to BuzzBoard
      </h1>

      <p className="mb-6 text-2xl text-gray-500">
        Please Sign In to Create an Event
      </p>

    </section>
  );
}