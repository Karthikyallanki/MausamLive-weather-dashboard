import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MausamLive — Worldwide Real-Time Weather Application',
  description:
    'MausamLive is a responsive worldwide real-time weather application providing current conditions, rainfall probability, precipitation, hourly forecasts, multi-day forecasts, weather details, location-based detection, weather alerts, and browser notifications.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
