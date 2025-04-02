import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next"

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
  metadataBase: new URL("https://talktosanta.io"),
  title: "Talk to Rocky",
  description: "Talk to Rocky",
  keywords: [
    "Santa Claus",
    "AI Santa",
    "Christmas",
    "Holiday",
    "Virtual Santa",
    "North Pole",
    "Talk to Santa",
    "ElevenLabs",
    "AI Chat",
    "Conversational AI",
  ],
  openGraph: {
    title: "Talk to Rocky",
    description: "Talk to Rocky",
    images: [
      {
        url: "/assets/Call_Rocky.png",
        width: 1200,
        height: 630,
        alt: "Interactive AI Rocky",
      },
    ],
    type: "website",
    locale: "en_US",
    siteName: "Talk to Rocky",
  },
  twitter: {
    card: "summary_large_image",
    title: "Talk to Rocky",
    description:
      "Experience a real-time conversation with Rocky, powered by EleveLabs Conversational AI.",
    images: ["/assets/Call_Rocky.png"],
    creator: "@elevenlabsio",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
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
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
