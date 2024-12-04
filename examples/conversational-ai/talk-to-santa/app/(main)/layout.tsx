import { Logo } from "@/components/logo/index";
import { ChristmasCountdown } from "@/components/christmas-countdown";
import { Snowfall } from "@/components/snowfall";
import { MusicPlayer } from "@/components/music-player";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen overflow-hidden font-[family-name:var(--font-geist-sans)]">
      <div className="absolute top-0 left-0 right-0 flex justify-between p-4 z-10">
        <Logo />
        <ChristmasCountdown />
      </div>

      <main>
        <div className="flex flex-col items-center justify-center min-h-screen">
          {children}
        </div>
      </main>

      <div
        className="absolute inset-0 z-[-2]"
        style={{
          background: `radial-gradient(circle, rgb(168 0 0 / 50%) 20%, rgba(0,0,0,0.7) 100%), url('/assets/background.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "color-burn",
        }}
      />
      <div className="absolute inset-0 z-[-1]">
        <Snowfall />
      </div>
      <MusicPlayer />
    </div>
  );
}
