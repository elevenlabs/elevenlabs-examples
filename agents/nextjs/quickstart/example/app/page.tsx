"use client";

import { useConversation } from "@elevenlabs/react";
import { useCallback, useState } from "react";

type ConversationMessage = {
  message: string;
  event_id?: number;
  role: "user" | "agent";
};

type TranscriptEntry = {
  id: string;
  role: "user" | "agent";
  text: string;
  /** Agent line still receiving streamed text */
  isStreaming?: boolean;
};

async function ensureMicrophonePermission(): Promise<void> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getTracks().forEach((t) => t.stop());
}

export default function Home() {
  const { startSession, endSession, status, isSpeaking } = useConversation();
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const appendUserMessage = useCallback((message: string, eventId?: number) => {
    setEntries((prev) => [
      ...prev,
      {
        id: `u-${eventId ?? "e"}-${crypto.randomUUID()}`,
        role: "user",
        text: message,
      },
    ]);
  }, []);

  const onMessage = useCallback(
    (props: ConversationMessage) => {
      if (props.role === "user") {
        appendUserMessage(props.message, props.event_id);
        return;
      }
      setEntries((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === "agent" && last.isStreaming) {
          next[next.length - 1] = {
            ...last,
            text: props.message,
            isStreaming: false,
          };
          return next;
        }
        return [
          ...next,
          {
            id: `a-${props.event_id ?? "e"}`,
            role: "agent",
            text: props.message,
          },
        ];
      });
    },
    [appendUserMessage],
  );

  const onAgentChatResponsePart = useCallback(
    (part: { text: string; type: "start" | "delta" | "stop"; event_id: number }) => {
      setEntries((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];

        if (part.type === "start") {
          return [
            ...next,
            {
              id: `a-stream-${part.event_id}`,
              role: "agent",
              text: "",
              isStreaming: true,
            },
          ];
        }

        if (part.type === "delta") {
          if (last?.role === "agent" && last.isStreaming) {
            next[next.length - 1] = { ...last, text: last.text + part.text };
            return next;
          }
          return [
            ...next,
            {
              id: `a-stream-${part.event_id}`,
              role: "agent",
              text: part.text,
              isStreaming: true,
            },
          ];
        }

        if (part.type === "stop" && last?.role === "agent" && last.isStreaming) {
          next[next.length - 1] = { ...last, isStreaming: false };
          return next;
        }

        return next;
      });
    },
    [],
  );

  const handleStart = async () => {
    setError(null);
    setEntries([]);

    try {
      await ensureMicrophonePermission();
    } catch {
      setError("Microphone permission is required to talk to the agent.");
      return;
    }

    let token: string;
    try {
      const res = await fetch("/api/conversation-token");
      const data: { token?: string; error?: string } = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not get a conversation token.");
        return;
      }
      if (!data.token) {
        setError("Server did not return a conversation token.");
        return;
      }
      token = data.token;
    } catch {
      setError("Network error while requesting a conversation token.");
      return;
    }

    try {
      await startSession({
        conversationToken: token,
        connectionType: "webrtc",
        onMessage,
        onAgentChatResponsePart,
        onError: (message) => setError(message),
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to start the session.";
      setError(message);
    }
  };

  const handleStop = async () => {
    setError(null);
    try {
      await endSession();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to end the session.";
      setError(message);
    }
  };

  const live =
    status === "connected" ||
    status === "connecting" ||
    status === "disconnecting";

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-16">
        <header className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
            Voice Agent
          </h1>
          <p className="text-sm text-neutral-500">
            Live voice conversation with ElevenLabs Agents.
          </p>
        </header>

        <div className="mt-10 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 disabled:opacity-50"
              disabled={live}
              onClick={() => void handleStart()}
            >
              Start
            </button>
            <button
              type="button"
              className="rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 disabled:opacity-50"
              disabled={!live}
              onClick={() => void handleStop()}
            >
              Stop
            </button>
          </div>

          <div className="space-y-1 text-xs text-neutral-400">
            <p>
              Status: <span className="text-neutral-600">{status}</span>
            </p>
            <p>
              Agent speaking:{" "}
              <span className="text-neutral-600">{isSpeaking ? "yes" : "no"}</span>
            </p>
          </div>

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <section aria-label="Conversation transcript" className="space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Transcript
            </h2>
            {entries.length === 0 ? (
              <p className="text-sm text-neutral-500">
                Start a session to see the conversation here.
              </p>
            ) : (
              <ul className="space-y-3">
                {entries.map((line) => (
                  <li
                    key={line.id}
                    className={
                      line.role === "user"
                        ? "text-sm text-neutral-900"
                        : line.isStreaming
                          ? "text-sm italic text-neutral-400"
                          : "text-sm text-neutral-700"
                    }
                  >
                    <span className="font-medium text-neutral-500">
                      {line.role === "user" ? "You" : "Agent"}
                      {line.isStreaming ? " (typing)" : ""}
                    </span>
                    <span className="mt-0.5 block whitespace-pre-wrap">
                      {line.text || (line.isStreaming ? "…" : "")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
