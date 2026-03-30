"use client";

import { audioBufferToWav, pickRecorderMimeType } from "@/lib/wav";
import { useCallback, useEffect, useRef, useState } from "react";

type Phase = "idle" | "recording" | "preparing" | "polling" | "ready" | "error";

const SOURCE_LANGS = [
  { code: "auto", label: "Auto (detect)" },
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "hi", label: "Hindi" },
] as const;

const TARGET_LANGS = SOURCE_LANGS.filter((l) => l.code !== "auto");

export default function Home() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [micError, setMicError] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("es");
  const [wavFile, setWavFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [dubbedUrl, setDubbedUrl] = useState<string | null>(null);

  const originalUrlRef = useRef<string | null>(null);
  const dubbedUrlRef = useRef<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollActiveRef = useRef(false);
  const targetLangRef = useRef(targetLang);

  useEffect(() => {
    targetLangRef.current = targetLang;
  }, [targetLang]);

  const revokeOriginal = useCallback(() => {
    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
      originalUrlRef.current = null;
    }
    setOriginalUrl(null);
  }, []);

  const revokeDubbed = useCallback(() => {
    if (dubbedUrlRef.current) {
      URL.revokeObjectURL(dubbedUrlRef.current);
      dubbedUrlRef.current = null;
    }
    setDubbedUrl(null);
  }, []);

  const resetAll = useCallback(() => {
    if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    pollTimeoutRef.current = null;
    pollActiveRef.current = false;
    revokeOriginal();
    revokeDubbed();
    setWavFile(null);
    setInlineError(null);
    setMicError(null);
    setElapsedSec(0);
    setPhase("idle");
  }, [revokeDubbed, revokeOriginal]);

  useEffect(() => {
    if (phase !== "recording") return;
    const id = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const startRecording = useCallback(async () => {
    setMicError(null);
    setInlineError(null);
    revokeOriginal();
    setWavFile(null);
    revokeDubbed();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickRecorderMimeType();
      const rec = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        mediaRecorderRef.current = null;
        const blob = new Blob(chunksRef.current, {
          type: rec.mimeType || "audio/webm",
        });
        chunksRef.current = [];
        setPhase("preparing");
        try {
          const ctx = new AudioContext();
          const ab = await blob.arrayBuffer();
          const decoded = await ctx.decodeAudioData(ab.slice(0));
          const wavBlob = audioBufferToWav(decoded);
          await ctx.close();
          const file = new File([wavBlob], "recording.wav", { type: "audio/wav" });
          setWavFile(file);
          revokeOriginal();
          const url = URL.createObjectURL(wavBlob);
          originalUrlRef.current = url;
          setOriginalUrl(url);
          setPhase("idle");
        } catch (e) {
          setInlineError(
            e instanceof Error ? e.message : "Could not convert recording to WAV.",
          );
          setPhase("error");
        }
      };
      mediaRecorderRef.current = rec;
      rec.start();
      setElapsedSec(0);
      setPhase("recording");
    } catch (e) {
      setMicError(
        e instanceof Error
          ? e.message
          : "Microphone access was denied or unavailable.",
      );
    }
  }, [revokeDubbed, revokeOriginal]);

  const stopRecording = useCallback(() => {
    const rec = mediaRecorderRef.current;
    if (!rec || rec.state !== "recording") return;
    rec.stop();
  }, []);

  const runPoll = useCallback(
    (id: string) => {
      pollActiveRef.current = true;

      const step = async () => {
        if (!pollActiveRef.current) return;
        try {
          const res = await fetch(`/api/dubbing/${id}`);
          const data: {
            error?: string;
            status?: string;
          } = await res.json().catch(() => ({}));

          if (!res.ok) {
            setInlineError(
              typeof data.error === "string" ? data.error : "Status check failed.",
            );
            setPhase("error");
            pollActiveRef.current = false;
            return;
          }

          if (data.error) {
            setInlineError(data.error);
            setPhase("error");
            pollActiveRef.current = false;
            return;
          }

          if (data.status === "failed") {
            setInlineError(data.error || "Dubbing failed.");
            setPhase("error");
            pollActiveRef.current = false;
            return;
          }

          if (data.status === "dubbed") {
            pollActiveRef.current = false;
            const lang = targetLangRef.current;
            const audioRes = await fetch(`/api/dubbing/${id}/audio/${lang}`);
            if (!audioRes.ok) {
              const errJson = await audioRes.json().catch(() => ({}));
              setInlineError(
                typeof errJson.error === "string"
                  ? errJson.error
                  : "Could not load dubbed audio.",
              );
              setPhase("error");
              return;
            }
            const buf = await audioRes.arrayBuffer();
            const blob = new Blob([buf], { type: "audio/mpeg" });
            revokeDubbed();
            const u = URL.createObjectURL(blob);
            dubbedUrlRef.current = u;
            setDubbedUrl(u);
            setPhase("ready");
            return;
          }

          pollTimeoutRef.current = setTimeout(step, 5000);
        } catch {
          setInlineError("Network error while polling.");
          setPhase("error");
          pollActiveRef.current = false;
        }
      };

      void step();
    },
    [revokeDubbed],
  );

  const handleDub = useCallback(async () => {
    if (!wavFile) return;
    if (sourceLang !== "auto" && sourceLang === targetLang) {
      setInlineError("Source and target language must differ when source is not Auto.");
      return;
    }
    setInlineError(null);
    setPhase("polling");

    const fd = new FormData();
    fd.set("audio", wavFile);
    fd.set("targetLang", targetLang);
    fd.set("sourceLang", sourceLang);

    try {
      const res = await fetch("/api/dubbing", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setInlineError(
          typeof data.error === "string" ? data.error : "Upload or dubbing start failed.",
        );
        setPhase("error");
        return;
      }
      const id = data.dubbingId as string | undefined;
      if (!id) {
        setInlineError("Missing dubbing id in response.");
        setPhase("error");
        return;
      }
      runPoll(id);
    } catch {
      setInlineError("Network error while uploading.");
      setPhase("error");
    }
  }, [runPoll, sourceLang, targetLang, wavFile]);

  const langConflict =
    sourceLang !== "auto" && sourceLang === targetLang;

  const statusLabel = (() => {
    switch (phase) {
      case "recording":
        return "Recording";
      case "preparing":
        return "Preparing";
      case "polling":
        return "Dubbing";
      case "ready":
        return "Ready";
      case "error":
        return "Error";
      default:
        return wavFile ? "Ready to dub" : "Idle";
    }
  })();

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-16">
        <header className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
            Browser dubbing
          </h1>
          <p className="text-sm text-neutral-500">
            Record audio, choose languages, and dub with ElevenLabs.
          </p>
        </header>

        <div className="mt-10 space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-neutral-400">Status</span>
            <span className="text-sm text-neutral-700">{statusLabel}</span>
            {phase === "recording" && (
              <>
                <span
                  className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse"
                  aria-hidden
                />
                <span className="text-sm tabular-nums text-neutral-600">
                  {elapsedSec}s
                </span>
              </>
            )}
          </div>

          {micError && (
            <p className="text-sm text-red-600" role="alert">
              {micError}
            </p>
          )}
          {inlineError && (
            <p className="text-sm text-red-600" role="alert">
              {inlineError}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {phase !== "recording" &&
              phase !== "preparing" &&
              phase !== "polling" && (
                <button
                  type="button"
                  className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                  onClick={startRecording}
                >
                  {wavFile ? "Record new take" : "Start recording"}
                </button>
              )}
            {phase === "recording" && (
              <button
                type="button"
                className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-900"
                onClick={stopRecording}
              >
                Stop
              </button>
            )}
          </div>

          {phase === "preparing" && (
            <p className="text-sm text-neutral-600">Converting to WAV…</p>
          )}
          {phase === "polling" && (
            <p className="text-sm text-neutral-600">
              Dubbing in progress. Checking every 5 seconds…
            </p>
          )}

          {originalUrl && (
            <section className="space-y-2">
              <p className="text-xs text-neutral-400">Original</p>
              <audio className="w-full" controls src={originalUrl} />
            </section>
          )}

          {wavFile && phase !== "recording" && phase !== "preparing" && (
            <section className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-xs text-neutral-400">Source language</span>
                  <select
                    className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                    disabled={phase === "polling"}
                  >
                    {SOURCE_LANGS.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-xs text-neutral-400">Target language</span>
                  <select
                    className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    disabled={phase === "polling"}
                  >
                    {TARGET_LANGS.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {langConflict && (
                <p className="text-sm text-amber-700">
                  Pick a different target or change the source language.
                </p>
              )}
              <button
                type="button"
                className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleDub}
                disabled={phase === "polling" || langConflict}
              >
                Dub recording
              </button>
            </section>
          )}

          {dubbedUrl && phase === "ready" && (
            <section className="space-y-3">
              <p className="text-xs text-neutral-400">Dubbed</p>
              <audio className="w-full" controls src={dubbedUrl} />
              <a
                className="inline-block text-sm font-medium text-neutral-900 underline underline-offset-2"
                href={dubbedUrl}
                download="dubbed.mp3"
              >
                Download MP3
              </a>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
