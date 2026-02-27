export default function Home() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-16">
        <header className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
            Realtime Transcription
          </h1>
          <p className="text-sm text-zinc-500">
            Live and committed speech transcription with ElevenLabs Scribe.
          </p>
        </header>

        <section className="mt-6 space-y-4 rounded-lg border border-zinc-200 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <button className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900">
              Start
            </button>
            <p className="text-xs text-zinc-500">status</p>
          </div>

          <div className="h-9 text-xs text-zinc-400">
            waveform goes here
          </div>

          <div className="min-h-12 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500">
            live transcript goes here
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-medium text-zinc-700">History</h2>
          <div className="mt-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-500">
            transcription history goes here
          </div>
        </section>
      </div>
    </main>
  );
}
