import type { Metadata } from 'next';
import './globals.css';
import { Footer } from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: 'TypeCraft',
  description: 'Test your typing speed, compete with friends in real-time multiplayer races, and track your progress over time.',
  keywords: ['typing test', 'wpm', 'typing speed', 'multiplayer typing', 'monkeytype'],
    icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'TypeCraft',
    description: 'Real-time multiplayer typing speed test',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-bg text-text-primary antialiased font-sans min-h-screen flex flex-col">
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
