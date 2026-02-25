"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useScribe, CommitStrategy } from "@elevenlabs/react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from "@/components/ui/conversation";
import { Button } from "@/components/ui/button";
import { LiveWaveform } from "@/components/ui/live-waveform";

export default function Home() {
  const [committedSegments, setCommittedSegments] = useState<string[]>([]);
  const [partial, setPartial] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const intentionalDisconnectRef = useRef(false);

  // In development, suppress the Next.js error overlay for transient 1006 close
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const handler = (event: ErrorEvent) => {
      if (
        intentionalDisconnectRef.current &&
        typeof event.message === "string" &&
        event.message.includes("1006")
      ) {
        event.preventDefault();
      }
    };

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      const msg = String(event.reason?.message ?? event.reason ?? "");
      if (intentionalDisconnectRef.current && msg.includes("1006")) {
        event.preventDefault();
      }
    };

    window.addEventListener("error", handler);
    window.addEventListener("unhandledrejection", rejectionHandler);
    return () => {
      window.removeEventListener("error", handler);
      window.removeEventListener("unhandledrejection", rejectionHandler);
    };
  }, []);

  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    commitStrategy: CommitStrategy.VAD,
    vadSilenceThresholdSecs: 1.0,
    vadThreshold: 0.5,
    onPartialTranscript: (data) => {
      setPartial(data.text);
    },
    onCommittedTranscript: (data) => {
      if (data.text.trim()) {
        setCommittedSegments((prev) => [data.text.trim(), ...prev]);
      }
      setPartial("");
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : String(err);
      // Suppress transient 1006 close during intentional disconnect
      if (
        intentionalDisconnectRef.current &&
        msg.includes("1006")
      ) {
        return;
      }
      setError(msg);
    },
    onDisconnect: () => {
      setIsLive(false);
      // Clear the intentional-disconnect guard after a brief window
      setTimeout(() => {
        intentionalDisconnectRef.current = false;
      }, 500);
    },
  });

  const isConnected = scribe.isConnected;

  const toggle = useCallback(async () => {
    if (isLive) {
      intentionalDisconnectRef.current = true;
      scribe.disconnect();
      setPartial("");
      setIsLive(false);
    } else {
      setError(null);
      try {
        const res = await fetch("/api/scribe-token");
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to get token");
          return;
        }
        await scribe.connect({
          token: data.token,
          microphone: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        setIsLive(true);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Connection failed";
        setError(msg);
      }
    }
  }, [isLive, scribe]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center w-full max-w-lg">
        <section className="rounded-3xl w-full border border-border/70 bg-background/95 p-6 shadow-sm">
          <header className="mb-4">
            <h1 className="text-lg font-medium">
              {isConnected ? "Transcribing" : "Disconnected"}
            </h1>
          </header>
          <div className="flex flex-col gap-4 items-center">
            {isLive && (
              <LiveWaveform
                active={true}
                mode="static"
                height={48}
                barWidth={3}
                fadeEdges={true}
              />
            )}
            <Button
              onClick={toggle}
              variant="outline"
              size="lg"
              className="rounded-full"
            >
              {isLive ? "Stop transcription" : "Start transcription"}
            </Button>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Conversation className="h-[300px] w-full">
              <ConversationContent className="flex flex-col gap-2">
                {committedSegments.length === 0 && !isLive && (
                  <ConversationEmptyState
                    title="No transcription yet"
                    description="Press Start to begin live transcription"
                  />
                )}
                {isLive && (
                  <p className="text-sm italic text-muted-foreground">
                    {partial.trim() || "Listening..."}
                  </p>
                )}
                {committedSegments.map((text, i) => (
                  <p key={i} className="text-sm">
                    {text}
                  </p>
                ))}
              </ConversationContent>
            </Conversation>
          </div>
        </section>
      </main>
    </div>
  );
}
