"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useScribe, CommitStrategy } from "@elevenlabs/react";

const EXPECTED_MANUAL_CLOSE_ERROR_PREFIX = "WebSocket closed unexpectedly: 1006";

function isExpectedManualCloseError(message: string) {
  return message.startsWith(EXPECTED_MANUAL_CLOSE_ERROR_PREFIX);
}

export default function Home() {
  const [committedSegments, setCommittedSegments] = useState<string[]>([]);
  const [partial, setPartial] = useState("");
  const [error, setError] = useState("");
  const manualDisconnectRef = useRef(false);
  const manualDisconnectTimerRef = useRef<number | null>(null);

  const endManualDisconnectWindow = useCallback(() => {
    manualDisconnectRef.current = false;
    if (manualDisconnectTimerRef.current !== null) {
      window.clearTimeout(manualDisconnectTimerRef.current);
      manualDisconnectTimerRef.current = null;
    }
  }, []);

  const startManualDisconnectWindow = useCallback(() => {
    manualDisconnectRef.current = true;
    if (manualDisconnectTimerRef.current !== null) {
      window.clearTimeout(manualDisconnectTimerRef.current);
    }
    manualDisconnectTimerRef.current = window.setTimeout(() => {
      manualDisconnectRef.current = false;
      manualDisconnectTimerRef.current = null;
    }, 3000);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    const originalConsoleError = console.error;
    // Avoid noisy dev overlay for the known 1006 race during user-triggered disconnect.
    console.error = (...args: unknown[]) => {
      const [firstArg] = args;
      if (
        manualDisconnectRef.current &&
        typeof firstArg === "string" &&
        isExpectedManualCloseError(firstArg)
      ) {
        return;
      }
      originalConsoleError(...args);
    };

    return () => {
      console.error = originalConsoleError;
      if (manualDisconnectTimerRef.current !== null) {
        window.clearTimeout(manualDisconnectTimerRef.current);
        manualDisconnectTimerRef.current = null;
      }
    };
  }, []);

  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    commitStrategy: CommitStrategy.VAD,
    vadThreshold: 0.4,
    vadSilenceThresholdSecs: 1.5,
    minSpeechDurationMs: 100,
    minSilenceDurationMs: 100,
    onPartialTranscript: (data) => {
      setPartial(data.text);
    },
    onCommittedTranscript: (data) => {
      if (data.text.trim()) {
        setCommittedSegments((prev) => [data.text, ...prev]);
      }
      setPartial("");
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "An error occurred.";
      if (manualDisconnectRef.current && isExpectedManualCloseError(message)) {
        return;
      }
      setError(message);
    },
    onDisconnect: () => {
      endManualDisconnectWindow();
    },
  });

  const isLive =
    scribe.status === "connecting" ||
    scribe.status === "connected" ||
    scribe.status === "transcribing";

  const isConnected = scribe.status === "connected" || scribe.status === "transcribing";
  const liveLine = partial.trim() || "Listening...";

  const toggle = useCallback(async () => {
    setError("");
    if (isLive) {
      startManualDisconnectWindow();
      scribe.disconnect();
      setPartial("");
      return;
    }

    endManualDisconnectWindow();

    try {
      const res = await fetch("/api/scribe-token");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to fetch token.");
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
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to connect.";
      setError(message);
    }
  }, [isLive, scribe, startManualDisconnectWindow, endManualDisconnectWindow]);

  return (
    <main
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        fontFamily: "system-ui, sans-serif",
        padding: "0 1rem",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
        Real-Time Transcription
      </h1>
      <p style={{ marginTop: 0, marginBottom: "1rem", color: "#888", fontSize: "0.9rem" }}>
        Microphone transcription powered by ElevenLabs Scribe v2
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
        <span
          style={{
            display: "inline-block",
            padding: "0.25rem 0.75rem",
            borderRadius: "4px",
            fontSize: "0.85rem",
            fontWeight: 500,
            color: isConnected ? "#166534" : "#555",
            backgroundColor: isConnected ? "#dcfce7" : "#f0f0f0",
          }}
        >
          {isConnected ? "connected" : "disconnected"}
        </span>

        <button
          onClick={toggle}
          disabled={false}
          style={{
            padding: "0.4rem 1.25rem",
            fontSize: "0.95rem",
            cursor: isLive ? "pointer" : "pointer",
            border: "1px solid #ccc",
            borderRadius: "4px",
            background: isLive ? "#fee2e2" : "#f0f0f0",
          }}
        >
          {isLive ? "Stop" : "Start"}
        </button>
      </div>

      {error && (
        <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>
      )}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {isLive && (
          <li
            style={{
              color: "gray",
              fontStyle: "italic",
              marginBottom: "0.5rem",
            }}
          >
            {liveLine}
          </li>
        )}
        {committedSegments.map((text, i) => (
          <li key={i} style={{ marginBottom: "0.5rem", color: "#000" }}>
            {text}
          </li>
        ))}
      </ul>
    </main>
  );
}
