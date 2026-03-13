import type { Metadata } from 'next';
import './globals.css';
import FirebaseClient from '@/components/FirebaseClient';

export const metadata: Metadata = {
  title: 'BuzzBoard',
  description: 'Team collaboration platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <FirebaseClient />
        {children}
      </body>
    </html>
  );
}
