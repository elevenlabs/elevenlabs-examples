import { Logo } from "@/components/logo/index";
import { ChristmasCountdown } from "@/components/christmas-countdown";
import { Snowfall } from "@/components/snowfall";
import { MusicPlayer } from "@/components/music-player";
import Link from "next/link";
import { DisclaimerButton } from "@/components/disclaimer-button";
import { DonationCountup } from "@/components/donation-countup";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen overflow-hidden font-[family-name:var(--font-geist-sans)]">
      <div className="absolute top-0 left-0 right-0 flex justify-between p-4 z-10">
        <Link href="/">
          <Logo />
        </Link>
        <div className="hidden md:block">
          <ChristmasCountdown />
        </div>
        <DonationCountup />
      </div>

      <main>
        <div className="flex flex-col items-center justify-center min-h-screen">
          {children}
        </div>
      </main>

      <div
        className="absolute inset-0 z-[-2]"
        style={{
          background: `url('/assets/background.webp')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 z-[-1]">
        <Snowfall />
      </div>
      <MusicPlayer />
      <DisclaimerButton />
    </div>
  );
}
