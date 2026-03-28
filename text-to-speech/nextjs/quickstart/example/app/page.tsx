"use client";

import { FormEvent, useCallback, useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const revokeAudioUrl = useCallback((url: string | null) => {
    if (url) {
      URL.revokeObjectURL(url);
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    revokeAudioUrl(audioUrl);
    setAudioUrl(null);

    setLoading(true);
    try {
      const res = await fetch("/api/generate-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const contentType = res.headers.get("Content-Type") ?? "";

      if (!res.ok) {
        if (contentType.includes("application/json")) {
          const data = (await res.json()) as { error?: string };
          setError(data.error ?? `Request failed (${res.status}).`);
        } else {
          setError(`Request failed (${res.status}).`);
        }
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-16">
        <header className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
            Text to Speech
          </h1>
          <p className="text-sm text-neutral-500">
            Generate speech from text with ElevenLabs.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mt-10 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="tts-text" className="text-xs text-neutral-400">
              Text
            </label>
            <textarea
              id="tts-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="w-full resize-y rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
              placeholder="Enter text to convert to speech…"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Generating…" : "Generate speech"}
          </button>
        </form>

        {error ? (
          <p className="mt-6 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        {audioUrl ? (
          <div className="mt-8 space-y-3">
            <p className="text-xs text-neutral-400">Playback</p>
            <audio controls src={audioUrl} className="w-full" />
            <p>
              <a
                href={audioUrl}
                download="speech.mp3"
                className="text-sm font-medium text-neutral-900 underline underline-offset-2"
              >
                Download MP3
              </a>
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
