export default function Home() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-16">
        <header className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
            Realtime Transcription
          </h1>
          <p className="text-sm text-neutral-500">
            Live speech-to-text with ElevenLabs Scribe.
          </p>
        </header>
      </div>
    </main>
  );
}
