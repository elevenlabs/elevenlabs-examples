import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <nav>
        <div className="mx-auto w-full max-w-6xl px-6 py-4 sm:px-10 lg:px-14">
          <Image
            src="/elevenlabs-logo-black.svg"
            alt="ElevenLabs logo"
            width={132}
            height={17}
            priority
          />
        </div>
      </nav>

      <main className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
        <header className="max-w-4xl space-y-4 text-left">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Realtime Transcription
          </h1>
          <h2 className="max-w-3xl text-xl leading-relaxed font-normal text-zinc-600">
            A minimal realtime transcription demo powered by ElevenLabs Scribe.
          </h2>
        </header>
        <section className="pt-14 text-left">
          <p className="text-xl leading-relaxed text-zinc-500">demo goes here</p>
        </section>
      </main>
    </div>
  );
}
