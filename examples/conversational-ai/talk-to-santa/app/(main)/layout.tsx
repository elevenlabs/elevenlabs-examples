import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";
import { Analytics } from "@vercel/analytics/react";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://talktosanta.io'),
  title: "Talk to Santa - Live AI Christmas Conversations | ElevenLabs",
  description: "Experience magical real-time conversations with Santa Claus using advanced AI technology. Perfect for children and families this holiday season. Powered by ElevenLabs AI.",
  keywords: ["Santa Claus", "AI Santa", "Christmas", "Kids", "Holiday", "Virtual Santa", "Talk to Santa", "ElevenLabs", "AI Chat"], 
  openGraph: {
    title: "Talk to Santa - Live AI Christmas Conversations | ElevenLabs",
    description: "Experience magical real-time conversations with Santa Claus using advanced AI technology. Perfect for children and families this holiday season.",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Interactive AI Santa Claus Experience by ElevenLabs",
      },
    ],
    type: "website",
    locale: "en_US",
    siteName: "Talk to Santa",
  },
  twitter: {
    card: "summary_large_image",
    title: "Talk to Santa - Live AI Christmas Conversations | ElevenLabs",
    description: "Experience magical real-time conversations with Santa Claus using advanced AI technology. Perfect for children and families.",
    images: ["/og-image.jpg"],
    creator: "@elevenlabsio",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster richColors position="top-right" />
        <Analytics />
      </body>
    </html>
  );
}
