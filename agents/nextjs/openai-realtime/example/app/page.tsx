"use client";

import {
  type RealtimeEventLogEntry,
  type SessionInfo,
  useRealtimeSession,
} from "@/hooks/use-realtime-session";

export default function Home() {
  const {
    status,
    sessionInfo,
    transcript,
    isUserSpeaking,
    isAssistantSpeaking,
    isResponding,
    responseStatus,
    events,
    error,
    start,
    stop,
  } = useRealtimeSession();

  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-16">
        <header className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
            OpenAI Realtime SDK
          </h1>
          <p className="text-sm text-neutral-500">
            Talk to ElevenLabs Realtime using OpenAI&apos;s Realtime SDK.
          </p>
        </header>

        <section className="mt-10 space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => void (isConnected ? stop() : start())}
              disabled={isConnecting}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isConnected ? "Stop" : isConnecting ? "Connecting…" : "Start"}
            </button>
            <span className="text-xs text-neutral-400">
              {isConnected
                ? "Connected"
                : isConnecting
                  ? "Connecting…"
                  : "Disconnected"}
            </span>
          </div>

          {isConnected ? (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <Indicator active={isUserSpeaking} label="You speaking" />
              <Indicator active={isAssistantSpeaking} label="Agent speaking" />
              <Indicator active={isResponding} label="Responding" />
              {responseStatus && responseStatus !== "in_progress" ? (
                <span className="text-neutral-400">
                  Last response: {responseStatus}
                </span>
              ) : null}
            </div>
          ) : null}

          {isConnected && sessionInfo ? (
            <SessionInfoLine info={sessionInfo} />
          ) : null}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="space-y-2">
            <h2 className="text-sm font-medium text-neutral-800">Transcript</h2>
            <ul className="space-y-2 text-sm">
              {transcript.length === 0 ? (
                <li className="text-neutral-400">No messages yet.</li>
              ) : (
                transcript.map(entry => (
                  <li key={entry.id} className="space-y-0.5">
                    <span className="text-xs uppercase text-neutral-400">
                      {entry.role === "user" ? "You" : "Agent"}
                    </span>
                    <p
                      className={
                        entry.text ? "text-neutral-900" : "text-neutral-400"
                      }
                    >
                      {entry.text ||
                        (entry.role === "user" ? "Transcribing…" : "…")}
                      {entry.text && !entry.isFinal ? (
                        <span className="animate-pulse" aria-hidden>
                          ▍
                        </span>
                      ) : null}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </div>

          {events.length > 0 ? <EventLog events={events} /> : null}
        </section>
      </div>
    </main>
  );
}

function Indicator({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={active ? "text-neutral-900" : "text-neutral-400"}>
      {active ? "● " : "○ "}
      {label}
    </span>
  );
}

function SessionInfoLine({ info }: { info: SessionInfo }) {
  const parts = [
    info.model,
    info.voice ?? "default voice",
    info.turnDetection ?? "vad",
  ];
  return <p className="text-xs text-neutral-400">{parts.join(" · ")}</p>;
}

function EventLog({ events }: { events: RealtimeEventLogEntry[] }) {
  return (
    <details className="text-xs">
      <summary className="cursor-pointer font-medium text-neutral-500">
        Transport events ({events.length})
      </summary>
      <ul className="mt-2 max-h-48 overflow-y-auto font-mono">
        {events.toReversed().map(event => (
          <li key={event.id} className="flex items-baseline gap-2 py-0.5">
            <span className="tabular-nums text-neutral-400">
              {new Date(event.at).toLocaleTimeString()}
            </span>
            <span className="text-neutral-900">{event.type}</span>
            {event.summary ? (
              <span className="truncate text-neutral-500">{event.summary}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </details>
  );
}
