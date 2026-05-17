import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Homi — AI agents running property management',
  description: 'A pixel-art operating center for AI agents that actually run property management.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
