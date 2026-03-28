"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

const DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";
const DEFAULT_MODEL_ID = "eleven_multilingual_sts_v2";

type VoiceOption = {
  voiceId: string;
  name: string;
  previewUrl: string | null;
};

export default function Home() {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [voicesError, setVoicesError] = useState<string | null>(null);
  const [voiceId, setVoiceId] = useState(DEFAULT_VOICE_ID);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/voices");
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            typeof data.error === "string" ? data.error : "Failed to load voices."
          );
        }
        const list = Array.isArray(data.voices) ? data.voices : [];
        if (!cancelled) {
          setVoices(list);
          setVoicesError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setVoicesError(e instanceof Error ? e.message : "Failed to load voices.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const voiceOptions = useMemo(() => {
    if (voices.length === 0) {
      return [
        {
          voiceId: DEFAULT_VOICE_ID,
          name: "George",
          previewUrl: null as string | null,
        },
      ];
    }
    if (voices.some((v) => v.voiceId === DEFAULT_VOICE_ID)) {
      return voices;
    }
    return [
      {
        voiceId: DEFAULT_VOICE_ID,
        name: "George",
        previewUrl: null as string | null,
      },
      ...voices,
    ];
  }, [voices]);

  const onFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const next = e.target.files?.[0] ?? null;
      setFile(next);
      setError(null);
      setAudioUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    },
    []
  );

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!file) {
        setError("Choose an audio file.");
        return;
      }

      setError(null);
      setLoading(true);
      setAudioUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });

      try {
        const fd = new FormData();
        fd.append("audio", file);
        fd.append("voiceId", voiceId);
        fd.append("modelId", DEFAULT_MODEL_ID);

        const res = await fetch("/api/voice-changer", {
          method: "POST",
          body: fd,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            typeof data.error === "string" ? data.error : `Request failed (${res.status}).`
          );
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Conversion failed.");
      } finally {
        setLoading(false);
      }
    },
    [file, voiceId]
  );

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-16">
        <header className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
            Voice Changer
          </h1>
          <p className="text-sm text-neutral-500">
            Transform your recording with another voice using ElevenLabs speech-to-speech.
          </p>
        </header>

        <div className="mt-10 space-y-8">
          {voicesError ? (
            <p className="text-sm text-neutral-500" role="status">
              {voicesError}
            </p>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="audio-file"
                className="text-xs text-neutral-400"
              >
                Audio file
              </label>
              <input
                id="audio-file"
                name="audio"
                type="file"
                accept=".mp3,.wav,.m4a,.webm,.ogg,audio/*"
                onChange={onFileChange}
                className="block w-full text-sm text-neutral-900 file:mr-4 file:rounded-md file:border file:border-neutral-200 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-neutral-900"
              />
              {file ? (
                <p className="text-xs text-neutral-400">{file.name}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="voice" className="text-xs text-neutral-400">
                Voice
              </label>
              <select
                id="voice"
                name="voiceId"
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
              >
                {voiceOptions.map((v) => (
                  <option key={v.voiceId} value={v.voiceId}>
                    {v.name || v.voiceId}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading || !file}
                className="rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Converting…" : "Convert"}
              </button>
              {loading ? (
                <span
                  className="inline-block size-5 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900"
                  aria-hidden
                />
              ) : null}
            </div>
          </form>

          {error ? (
            <p className="text-sm text-neutral-900" role="alert">
              {error}
            </p>
          ) : null}

          {audioUrl ? (
            <div className="space-y-3">
              <p className="text-xs text-neutral-400">Result</p>
              <audio src={audioUrl} controls className="w-full" />
              <a
                href={audioUrl}
                download="converted.mp3"
                className="inline-block text-sm font-medium text-neutral-900 underline underline-offset-2"
              >
                Download
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
