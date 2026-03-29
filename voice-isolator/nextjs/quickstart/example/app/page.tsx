"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type AppStatus = "idle" | "recording" | "processing";

function formatElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Home() {
  const [status, setStatus] = useState<AppStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isolatedUrl, setIsolatedUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      cleanupStream();
    };
  }, [cleanupStream]);

  const revokeUrls = useCallback(() => {
    setRecordedUrl(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setIsolatedUrl(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const startRecording = async () => {
    setError(null);
    revokeUrls();
    setRecordedBlob(null);
    setIsolatedUrl(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      let mimeType = "";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
      }

      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );
      chunksRef.current = [];

      recorder.ondataavailable = ev => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };

      recorder.onstop = () => {
        cleanupStream();
        const type = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        chunksRef.current = [];
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedUrl(prev => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        setStatus("idle");
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus("recording");
      setElapsedSec(0);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setElapsedSec(n => n + 1);
      }, 1000);
    } catch (e) {
      cleanupStream();
      if (e instanceof DOMException && e.name === "NotAllowedError") {
        setError(
          "Microphone access was denied. Allow microphone access in your browser settings to record."
        );
      } else {
        setError("Could not access the microphone.");
      }
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
  };

  const isolateVoice = async () => {
    if (!recordedBlob) return;
    setStatus("processing");
    setError(null);
    try {
      const fd = new FormData();
      fd.append("audio", recordedBlob, "recording.webm");
      const res = await fetch("/api/isolate", { method: "POST", body: fd });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      const blob = await res.blob();
      setIsolatedUrl(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Isolation failed.");
    } finally {
      setStatus("idle");
    }
  };

  const recordAgain = () => {
    revokeUrls();
    setRecordedBlob(null);
    setError(null);
    setElapsedSec(0);
  };

  const canIsolate =
    status === "idle" && recordedBlob !== null && isolatedUrl === null;

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-16">
        <header className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
            Voice Isolator
          </h1>
          <p className="text-sm text-neutral-500">
            Record audio and isolate speech with ElevenLabs Audio Isolation.
          </p>
        </header>

        <div className="mt-10 space-y-8">
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <div className="space-y-4">
            {status === "recording" ? (
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block size-2.5 shrink-0 rounded-full bg-red-600 animate-pulse"
                    aria-hidden
                  />
                  <span className="text-sm font-medium text-neutral-900">
                    Recording
                  </span>
                  <span className="text-xs text-neutral-400 tabular-nums">
                    {formatElapsed(elapsedSec)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900"
                >
                  Stop
                </button>
              </div>
            ) : status === "processing" ? (
              <div className="flex items-center gap-3">
                <span
                  className="inline-block size-5 shrink-0 rounded-full border-2 border-neutral-200 border-t-neutral-600 animate-spin"
                  aria-hidden
                />
                <span className="text-sm text-neutral-500">
                  Isolating voice…
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
              >
                Record
              </button>
            )}
          </div>

          {recordedUrl ? (
            <div className="space-y-2">
              <p className="text-xs text-neutral-400">Original recording</p>
              <audio className="w-full" controls src={recordedUrl} />
            </div>
          ) : null}

          {canIsolate ? (
            <button
              type="button"
              onClick={isolateVoice}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
            >
              Isolate Voice
            </button>
          ) : null}

          {isolatedUrl ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-neutral-400">Isolated Audio</p>
                <audio className="w-full" controls src={isolatedUrl} />
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={isolatedUrl}
                  download="isolated.mp3"
                  className="inline-block rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900"
                >
                  Download
                </a>
                <button
                  type="button"
                  onClick={recordAgain}
                  className="rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900"
                >
                  Record Again
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
