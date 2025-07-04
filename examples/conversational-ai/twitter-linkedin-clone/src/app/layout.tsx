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
            "w-full flex items-center justify-between py-3 px-3 sm:py-4 sm:px-8 z-50"
          }
        >
          <div className={"flex items-center"}>
            <Link href={"/"} prefetch={true} className="p-1">
              <ElevenLabsLogo
                className={
                  "h-[14px] sm:h-[15px] w-auto hover:text-gray-500 transition-colors"
                }
              />
            </Link>
          </div>
          <div className={"flex gap-1.5 sm:gap-3 items-center"}>
            <Link
              href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Felevenlabs%2Felevenlabs-examples%2Ftree%2Fmain%2Fexamples%2Fconversational-ai%2Ftwitter-linkedin-clone&env=PPLX_API_KEY,ELEVENLABS_API_KEY,OPENAI_API_KEY&envDescription=Required%20API%20keys%20for%20Perplexity%2C%20ElevenLabs%2C%20and%20OpenAI&envLink=https%3A%2F%2Fgithub.com%2Felevenlabs%2Felevenlabs-examples%2Ftree%2Fmain%2Fexamples%2Fconversational-ai%2Ftwitter-linkedin-clone%23api-keys-required&project-name=twitter-ai-twin&repository-name=twitter-ai-twin&demo-title=Twitter%20AI%20Twin%20Creator&demo-description=Create%20AI%20twins%20of%20Twitter%20profiles%20with%20voice%20cloning&demo-url=https%3A%2F%2Ftwitter-ai-twin.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Deploy with Vercel"
            >
              <Button
                variant={"secondary"}
                size={"xs"}
                className="rounded-full z-50 text-xs sm:text-sm bg-black text-white hover:bg-black/80 border-black h-7 sm:h-8 px-2.5 sm:px-3"
              >
                <svg
                  className="mr-1 sm:mr-1.5"
                  width="12"
                  height="12"
                  viewBox="0 0 76 65"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M37.5274 0L75.0548 65H0L37.5274 0Z"
                    fill="currentColor"
                  />
                </svg>
                <span className={"sm:inline hidden"}>Deploy on Vercel</span>
                <span className={"inline sm:hidden"}>Deploy</span>
              </Button>
            </Link>
            <Link
              href="https://elevenlabs.io/app/sign-in"
              target="_blank"
              aria-label="Create free account"
            >
              <Button
                variant={"secondary"}
                size={"xs"}
                className="rounded-full z-50 text-xs sm:text-sm text-gray-800 h-7 sm:h-8 px-2.5 sm:px-3"
              >
                <span className={"sm:inline hidden"}>Create free account</span>
                <span className={"inline sm:hidden"}>Sign up</span>
              </Button>
            </Link>
            <Link
              href="https://github.com/elevenlabs/elevenlabs-examples/tree/main/examples/conversational-ai/twitter-linkedin-clone"
              target="_blank"
              rel="noopener noreferrer"
              className={"p-1.5 sm:p-0.5"}
              aria-label="View source on GitHub"
            >
              <GithubLogo
                className={
                  "w-4 h-4 sm:w-5 sm:h-5 hover:text-gray-500 text-[#24292f] transition-colors"
                }
              />
            </Link>
          </div>
        </nav>

        <div className="flex-1 flex flex-col w-full items-center justify-center px-3 py-6 sm:px-4 sm:py-12 relative">
          {children}
          <BackgroundWave />
        </div>

        <FooterNav />

        <Toaster />
      </body>
    </html>
  );
}
