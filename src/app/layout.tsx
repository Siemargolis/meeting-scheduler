import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import './globals.css';

export const metadata: Metadata = {
  title: 'MeetSync - Meeting Scheduler',
  description: 'Schedule meetings with ease. Create polls, share links, and find the best time for everyone.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
