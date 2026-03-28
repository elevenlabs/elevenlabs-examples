"use client";

import { useCallback, useState, type FormEvent } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const revokeAudioUrl = useCallback(() => {
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    revokeAudioUrl();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/generate-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
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
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-16">
        <header className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
            Music playground
          </h1>
          <p className="text-sm text-neutral-500">
            Describe a track and generate a short MP3 with ElevenLabs Music.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mt-10 space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="prompt"
              className="text-xs font-medium text-neutral-400"
            >
              Prompt
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full resize-y rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
              placeholder="e.g. A mellow acoustic guitar piece with soft rain in the background"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || prompt.trim().length === 0}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Generating…" : "Generate"}
          </button>
        </form>

        {error ? (
          <p className="mt-6 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        {audioUrl ? (
          <div className="mt-8 space-y-3">
            <p className="text-xs text-neutral-400">Preview</p>
            <audio className="w-full" controls src={audioUrl} />
            <a
              href={audioUrl}
              download="generated.mp3"
              className="inline-block text-sm font-medium text-neutral-900 underline underline-offset-2"
            >
              Download MP3
            </a>
          </div>
        ) : null}
      </div>
    </main>
  );
}
