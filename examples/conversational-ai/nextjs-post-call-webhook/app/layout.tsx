import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Design your Conversational AI Agent | ElevenLabs",
  description: "Design your custom Conversational AI Agent using your voice.",
  generator: "v0.dev",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Design your Conversational AI Agent | ElevenLabs",
    description: "Design your custom Conversational AI Agent using your voice.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ElevenLabs Conversational AI Agent",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Design your Conversational AI Agent | ElevenLabs",
    description: "Design your custom Conversational AI Agent using your voice.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

import "./globals.css";
