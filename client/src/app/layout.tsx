import type { Metadata } from "next";
import { Inter, Righteous } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const righteous = Righteous({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-logo",
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
        className={`${inter.variable} ${righteous.variable} font-sans bg-[#fefcf3] text-zinc-900 antialiased transition-colors duration-300 dark:bg-[#111111] dark:text-zinc-50`}
      >
        <div className="liquid-bg" aria-hidden />
        {children}
      </body>
    </html>
  );
}