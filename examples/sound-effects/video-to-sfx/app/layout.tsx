import "@/app/globals.css";
import { Inter as FontSans } from "next/font/google";
import { GeistMono } from "geist/font/mono";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

import metaImage from "@/public/meta-image.png";
import { Metadata } from "next";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ElevenLabs Video to SFX Generator",
  description: "Generate a custom AI sound effect for your video",
  openGraph: {
    title: "ElevenLabs Video to SFX Generator",
    description: "Generate a custom AI sound effect for your video",
    images: [{ url: metaImage.src }],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(GeistMono.variable)}
      style={{
        // @ts-ignore
        "--font-mono": "var(--font-geist-mono)",
      }}
    >
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
