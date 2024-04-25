import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cn } from '~/lib/utils';
import './globals.css';

const font = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'ElevenLabs - Next.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          font.variable,
        )}
      >
        {children}
      </body>
    </html>
  );
}
