import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "BuzzBoard — Georgia Tech events",
  description:
    "Discover and share small-scale campus events—study sessions, hangouts, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans bg-[#fafafa] text-zinc-900 antialiased transition-colors duration-300 dark:bg-[#111111] dark:text-zinc-50`}
      >
        {children}
      </body>
    </html>
  );
}