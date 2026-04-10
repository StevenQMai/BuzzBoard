import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BuzzBoard",
  description: "Team collaboration platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-black transition-colors duration-300 dark:bg-[#111111] dark:text-white">
        {children}
      </body>
    </html>
  );
}