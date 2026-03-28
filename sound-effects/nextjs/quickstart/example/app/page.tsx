"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setLoading(true);
    try {
      const res = await fetch("/api/generate-sound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const contentType = res.headers.get("Content-Type") ?? "";
      if (!res.ok) {
        if (contentType.includes("application/json")) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error ?? `Request failed (${res.status})`);
        }
        throw new Error(`Request failed (${res.status})`);
      }
      const blob = await res.blob();
      setAudioUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-16">
        <header className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
            Sound effects
          </h1>
          <p className="text-sm text-neutral-500">
            Describe a sound and generate it with ElevenLabs.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mt-10 space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="prompt"
              className="block text-xs text-neutral-400"
            >
              Prompt
            </label>
            <textarea
              id="prompt"
              name="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full resize-y rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400"
              placeholder="e.g. Thunder rumbling in the distance with light rain"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 enabled:hover:bg-neutral-50 disabled:opacity-50"
          >
            {loading ? "Generating…" : "Generate"}
          </button>
        </form>

        {error ? (
          <p className="mt-6 text-sm text-neutral-600" role="alert">
            {error}
          </p>
        ) : null}

        {audioUrl ? (
          <div className="mt-8 space-y-2">
            <p className="text-xs text-neutral-400">Result</p>
            <audio className="w-full" controls src={audioUrl} />
          </div>
        ) : null}
      </div>
    </main>
  );
}
