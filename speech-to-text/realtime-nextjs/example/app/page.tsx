"use client";

import { useState, useCallback, useEffect } from "react";
import { useScribe, CommitStrategy } from "@elevenlabs/react";
import { LiveWaveform } from "@/components/ui/live-waveform";

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState("");
  const [committedTranscripts, setCommittedTranscripts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    commitStrategy: CommitStrategy.VAD, // Auto-commit on silence for mic input
    onPartialTranscript: (data) => {
      // Live feedback as user speaks
      setPartialTranscript(data.text || "");
    },
    onCommittedTranscript: (data) => {
      // Final transcript for this segment
      const text = data.text?.trim();
      if (text) {
        setCommittedTranscripts((prev) => [text, ...prev]); // Newest first
      }
      // Clear partial on commit
      setPartialTranscript("");
    },
    onError: (err) => {
      console.error("Scribe error:", err);
      setError(err.message || "An error occurred");
      handleStop();
    },
  });

  const handleStart = useCallback(async () => {
    try {
      setError(null);
      setIsConnecting(true);

      // Fetch a fresh token from our backend
      const tokenResponse = await fetch("/api/scribe-token");

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(errorData.error || `Failed to get token: ${tokenResponse.statusText}`);
      }

      const { token } = await tokenResponse.json();

      if (!token) {
        throw new Error("No token received from server");
      }

      // Connect with microphone settings
      await scribe.connect({
        token,
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setIsListening(true);
      setIsConnecting(false);
    } catch (err) {
      console.error("Failed to start transcription:", err);
      setError(err instanceof Error ? err.message : "Failed to start transcription");
      setIsConnecting(false);
    }
  }, [scribe]);

  const handleStop = useCallback(() => {
    try {
      scribe.disconnect();
      setIsListening(false);
      setIsConnecting(false);
      // Clear partial transcript on stop
      setPartialTranscript("");
      // Keep committed history
    } catch (err) {
      console.error("Error stopping transcription:", err);
    }
  }, [scribe]);

  // Handle WebSocket close events
  const isActiveStatus = scribe.status === "connected" || scribe.status === "transcribing";

  // If the status changes to disconnected while we think we're listening, handle it.
  useEffect(() => {
    if (!isListening || isActiveStatus || isConnecting) {
      return;
    }

    if (scribe.status === "disconnected") {
      setIsListening(false);
      setPartialTranscript("");

      if (error === null) {
        setError("Connection dropped. Please try again.");
      }
    }
  }, [isListening, isActiveStatus, isConnecting, scribe.status, error]);

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

        {error && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mt-6 space-y-4 rounded-lg border border-zinc-200 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={isListening || isConnecting ? handleStop : handleStart}
              disabled={isConnecting}
              className={`
                rounded-md px-4 py-2 text-sm font-medium transition-colors
                ${isListening || isConnecting
                  ? "bg-zinc-900 text-white hover:bg-zinc-800"
                  : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                }
                ${isConnecting ? "cursor-wait opacity-75" : ""}
              `}
            >
              {isListening ? "Stop" : isConnecting ? "Connecting..." : "Start"}
            </button>
            <p className="text-xs capitalize text-zinc-500">
              {scribe.status.replace("_", " ")}
            </p>
          </div>

          {(isListening || isConnecting) && (
            <LiveWaveform
              active={isActiveStatus}
              processing={scribe.status === "transcribing"}
              barColor="rgb(39, 39, 42)"
              height={36}
            />
          )}

          <div className="min-h-12 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
            {partialTranscript || (isListening ? "Listening..." : "No live transcript")}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-medium text-zinc-700">History</h2>
          {committedTranscripts.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">
              No transcriptions yet.
            </p>
          ) : (
            <ul className="mt-2 max-h-96 divide-y divide-zinc-200 overflow-y-auto rounded-lg border border-zinc-200">
              {committedTranscripts.map((text, index) => (
                <li key={index} className="px-3 py-2 text-sm text-zinc-700">
                  {text}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}