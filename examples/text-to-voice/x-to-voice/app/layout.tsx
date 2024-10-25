export const maxDuration = 60; // Applies to the actions
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import { BackgroundWave } from "@/components/background-wave";
import Link from "next/link";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Text to Voice || ElevenLabs",
  description: "Introducing our new Text to Voice API",
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
        <Link
          href="https://github.com/elevenlabs/elevenlabs-examples/tree/main/examples/text-to-voice/x-to-voice"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View source on GitHub"
        >
          <Button
            variant="ghost"
            className="fixed top-4 right-4 flex items-center gap-2 p-2 pr-3 rounded-lg z-50 text-sm font-medium"
          >
            <Github className="w-5 h-5" />
            <span className="opacity-50 hover:opacity-100 transition-opacity">
              Open source
            </span>
          </Button>
        </Link>
        <div className="flex flex-col min-h-screen w-full items-center justify-center px-4">
          {children}
          <BackgroundWave />
        </div>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
