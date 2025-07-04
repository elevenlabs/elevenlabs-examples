import { ElevenLabsLogo, GithubLogo } from "@/components/logos";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { BackgroundWave } from "@/components/background-wave";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FooterNav } from "@/components/footer-nav";

export const maxDuration = 90;

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
  title: "AI Twin Creator | ElevenLabs",
  description:
    "Create an AI twin of any Twitter/X or LinkedIn profile using ElevenLabs' Conversational AI and voice cloning technology",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={"h-full w-full"}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased w-full min-h-full flex flex-col`}
      >
        <nav
          className={
            "w-full flex items-center justify-between py-4 px-4 sm:px-8 z-50"
          }
        >
          <div className={"flex"}>
            <Link href={"/"} prefetch={true}>
              <ElevenLabsLogo
                className={"h-[15px] w-auto hover:text-gray-500"}
              />
            </Link>
          </div>
          <div className={"flex gap-2 sm:gap-4"}>
            <Link
              href="https://elevenlabs.io/app/sign-in"
              target="_blank"
              aria-label="Create free account"
            >
              <Button
                variant={"secondary"}
                size={"xs"}
                className="rounded-full z-50 text-sm text-gray-800"
              >
                <span className={"sm:inline hidden"}>Create free account</span>
                <span className={"inline sm:hidden"}>Sign up</span>
              </Button>
            </Link>
            <Link
              href="https://github.com/elevenlabs/elevenlabs-examples/tree/main/examples/conversational-ai/twitter-linkedin-clone"
              target="_blank"
              rel="noopener noreferrer"
              className={"py-0.5"}
              aria-label="View source on GitHub"
            >
              <GithubLogo
                className={"w-5 h-5 hover:text-gray-500 text-[#24292f]"}
              />
            </Link>
          </div>
        </nav>

        <div className="flex-1 flex flex-col w-full items-center justify-center px-4 py-8 sm:py-12 relative">
          {children}
          <BackgroundWave />
        </div>

        <FooterNav />

        <Toaster />
      </body>
    </html>
  );
}
