"use client";

import {
  ConversationProvider,
  useConversationControls,
  useConversationStatus,
} from "@elevenlabs/react";
import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type TranscriptLine = {
  id: string;
  role: "user" | "agent";
  text: string;
  tentative: boolean;
};

type VoiceAgentPageProps = {
  agentIdInput: string;
  agentLookupError: string | null;
  agentLookupOk: boolean;
  createError: string | null;
  creating: boolean;
  lines: TranscriptLine[];
  sessionError: string | null;
  setAgentIdInput: (value: string) => void;
  setAgentLookupError: (value: string | null) => void;
  setAgentLookupOk: (value: boolean) => void;
  setCreateError: (value: string | null) => void;
  setCreating: (value: boolean) => void;
  setLines: (value: TranscriptLine[]) => void;
  setSessionError: (value: string | null) => void;
  setStarting: (value: boolean) => void;
  starting: boolean;
  nextLineId: RefObject<number>;
};

type ConversationMessage = {
  source: "user" | "ai";
  message: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractMessageText(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.message === "string") {
    return value.message;
  }

  if (typeof value.text === "string") {
    return value.text;
  }

  return null;
}

function isConversationMessage(value: unknown): value is ConversationMessage {
  if (!isRecord(value)) {
    return false;
  }

  if (value.source !== "user" && value.source !== "ai") {
    return false;
  }

  return extractMessageText(value.message) !== null;
}

function VoiceAgentPage({
  agentIdInput,
  agentLookupError,
  agentLookupOk,
  createError,
  creating,
  lines,
  nextLineId,
  sessionError,
  setAgentIdInput,
  setAgentLookupError,
  setAgentLookupOk,
  setCreateError,
  setCreating,
  setLines,
  setSessionError,
  setStarting,
  starting,
}: VoiceAgentPageProps) {
  const { startSession, endSession } = useConversationControls();
  const { status, message } = useConversationStatus();

  const trimmedId = agentIdInput.trim();
  const canStart = trimmedId.length > 0 && !starting;
  const sessionActive = status === "connected" || status === "connecting";

  const statusLabel = (() => {
    switch (status) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting…";
      case "disconnected":
        return "Disconnected";
      case "error":
        return message?.trim() ? `Error: ${message}` : "Error";
      default: {
        const exhaustiveStatus: never = status;
        return exhaustiveStatus;
      }
    }
  })();

  function handleAgentIdChange(value: string) {
    setAgentIdInput(value);
    setAgentLookupError(null);
    setAgentLookupOk(false);
  }

  async function handleCreateAgent() {
    setCreateError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/agent", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(
          typeof data.error === "string" ? data.error : "Failed to create agent"
        );
        return;
      }
      const id = data.agentId as string;
      setAgentIdInput(id);
      setAgentLookupError(null);
      setAgentLookupOk(true);
    } catch {
      setCreateError("Network error while creating agent.");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleSession() {
    setSessionError(null);

    if (sessionActive) {
      endSession();
      setStarting(false);
      return;
    }

    if (!trimmedId) {
      return;
    }

    setStarting(true);
    nextLineId.current = 0;
    setLines([]);

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setSessionError("Microphone permission is required to talk.");
      setStarting(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/conversation-token?agentId=${encodeURIComponent(trimmedId)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setSessionError(
          typeof data.error === "string"
            ? data.error
            : "Could not get conversation token."
        );
        setStarting(false);
        return;
      }
      const token = data.token as string;
      await startSession({
        conversationToken: token,
      });
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : String(error));
    } finally {
      setStarting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-16">
        <header className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
            Voice agent
          </h1>
          <p className="text-sm text-neutral-500">
            Talk in real time with an ElevenLabs conversational agent.
          </p>
        </header>

        <section className="mt-10 space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1 space-y-1">
              <label htmlFor="agent-id" className="text-xs text-neutral-400">
                Agent id
              </label>
              <input
                id="agent-id"
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
                placeholder="Paste or create an agent id"
                value={agentIdInput}
                onChange={event => handleAgentIdChange(event.target.value)}
              />
              {agentLookupError ? (
                <p className="text-xs text-red-600">{agentLookupError}</p>
              ) : trimmedId && agentLookupOk ? (
                <p className="text-xs text-neutral-400">Agent found.</p>
              ) : null}
            </div>
            <button
              type="button"
              className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 disabled:opacity-50 sm:mt-6"
              onClick={handleCreateAgent}
              disabled={creating}
            >
              {creating ? "Creating…" : "Create agent"}
            </button>
          </div>
          {createError ? (
            <p className="text-xs text-red-600">{createError}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
              onClick={handleToggleSession}
              disabled={!canStart && !sessionActive}
            >
              {sessionActive ? "Stop" : starting ? "Starting…" : "Start"}
            </button>
            <span className="text-xs text-neutral-400">
              Status: {statusLabel}
            </span>
          </div>
          {sessionError ? (
            <p className="text-sm text-red-600">{sessionError}</p>
          ) : null}

          <div className="space-y-2">
            <p className="text-xs text-neutral-400">Transcript</p>
            <div
              className="max-h-[min(24rem,50vh)] space-y-2 overflow-y-auto pt-1"
              aria-live="polite"
            >
              {lines.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  {sessionActive
                    ? "Listening…"
                    : "Start a session to see the conversation here."}
                </p>
              ) : (
                lines.map(line => (
                  <div key={line.id} className="text-sm">
                    <span
                      className={
                        line.role === "user"
                          ? "font-medium text-neutral-900"
                          : "font-medium text-neutral-700"
                      }
                    >
                      {line.role === "user" ? "You" : "Agent"}
                    </span>
                    <span
                      className={
                        line.tentative
                          ? " text-neutral-400 italic"
                          : " text-neutral-800"
                      }
                    >
                      : {line.text}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function Home() {
  const [agentIdInput, setAgentIdInput] = useState("");
  const [agentLookupError, setAgentLookupError] = useState<string | null>(null);
  const [agentLookupOk, setAgentLookupOk] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [lines, setLines] = useState<TranscriptLine[]>([]);

  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextLineId = useRef(0);

  const trimmedId = agentIdInput.trim();

  useEffect(() => {
    if (lookupTimer.current) {
      clearTimeout(lookupTimer.current);
    }

    if (!trimmedId) {
      return;
    }

    lookupTimer.current = setTimeout(async () => {
      setAgentLookupError(null);
      setAgentLookupOk(false);
      try {
        const res = await fetch(
          `/api/agent?agentId=${encodeURIComponent(trimmedId)}`
        );
        const data = await res.json();
        if (!res.ok) {
          setAgentLookupError(
            typeof data.error === "string" ? data.error : "Agent lookup failed"
          );
          return;
        }
        setAgentLookupOk(true);
      } catch {
        setAgentLookupError("Network error while loading agent.");
      }
    }, 450);

    return () => {
      if (lookupTimer.current) {
        clearTimeout(lookupTimer.current);
      }
    };
  }, [trimmedId]);

  const handleMessage = useCallback((event: unknown) => {
    if (!isConversationMessage(event)) {
      return;
    }

    const text = extractMessageText(event.message)?.trim();
    if (!text) {
      return;
    }

    setLines(prev => {
      const role = event.source === "ai" ? "agent" : "user";
      const last = prev[prev.length - 1];

      if (last?.role === role && last.tentative) {
        const copy = [...prev];
        copy[copy.length - 1] = { ...last, text, tentative: false };
        return copy;
      }

      if (last && last.role === role && last.text === text) {
        return prev;
      }

      nextLineId.current += 1;
      return [
        ...prev,
        {
          id: `line-${nextLineId.current}`,
          role,
          text,
          tentative: false,
        },
      ];
    });
  }, []);

  const handleDebug = useCallback((event: unknown) => {
    if (
      !isRecord(event) ||
      event.type !== "internal_tentative_agent_response"
    ) {
      return;
    }

    const payload = event.tentative_agent_response_internal_event;
    if (!isRecord(payload)) {
      return;
    }

    const text =
      typeof payload.tentative_agent_response === "string"
        ? payload.tentative_agent_response.trim()
        : "";

    if (!text) {
      return;
    }

    setLines(prev => {
      const last = prev[prev.length - 1];
      if (last?.role === "agent" && last.tentative) {
        const copy = [...prev];
        copy[copy.length - 1] = { ...last, text };
        return copy;
      }

      nextLineId.current += 1;
      return [
        ...prev,
        {
          id: `line-${nextLineId.current}`,
          role: "agent",
          text,
          tentative: true,
        },
      ];
    });
  }, []);

  return (
    <ConversationProvider
      onConnect={() => setSessionError(null)}
      onDebug={handleDebug}
      onDisconnect={() => {
        setSessionError(null);
        setStarting(false);
      }}
      onError={(error: unknown) => {
        setSessionError(error instanceof Error ? error.message : String(error));
      }}
      onMessage={handleMessage}
    >
      <VoiceAgentPage
        agentIdInput={agentIdInput}
        agentLookupError={agentLookupError}
        agentLookupOk={agentLookupOk}
        createError={createError}
        creating={creating}
        lines={lines}
        nextLineId={nextLineId}
        sessionError={sessionError}
        setAgentIdInput={setAgentIdInput}
        setAgentLookupError={setAgentLookupError}
        setAgentLookupOk={setAgentLookupOk}
        setCreateError={setCreateError}
        setCreating={setCreating}
        setLines={setLines}
        setSessionError={setSessionError}
        setStarting={setStarting}
        starting={starting}
      />
    </ConversationProvider>
  );
}
