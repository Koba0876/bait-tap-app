import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Melina Mignani · Bait Society',
  description: 'Tap or scan to connect with Melina Mignani, Producer at Bait Society.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
