"use client";

import {
  OpenAIRealtimeWebSocket,
  RealtimeAgent,
  RealtimeSession,
  type TransportEvent,
} from "@openai/agents-realtime";
import { useCallback, useRef, useState } from "react";
import { WavRecorder, WavStreamPlayer } from "wavtools";

import {
  AGENT_INSTRUCTIONS,
  AUDIO_SAMPLE_RATE,
  REALTIME_MODEL,
  REALTIME_URL,
  REALTIME_VOICE,
} from "@/lib/realtime-session";

export type SessionStatus = "disconnected" | "connecting" | "connected";

export type ResponseStatus =
  | "in_progress"
  | "completed"
  | "cancelled"
  | "incomplete"
  | "failed";

const RESPONSE_STATUSES = new Set<string>([
  "in_progress",
  "completed",
  "cancelled",
  "incomplete",
  "failed",
]);

export type TranscriptEntry = {
  id: string;
  role: "user" | "assistant";
  text: string;
  isFinal: boolean;
  previousItemId?: string | null;
};

export type SessionInfo = {
  model: string;
  voice: string | null;
  turnDetection: string | null;
};

export type RealtimeEventLogEntry = {
  id: number;
  type: string;
  at: number;
  summary?: string;
};

const NOISY_EVENT_TYPES = new Set([
  "response.output_audio.delta",
  "response.output_audio_transcript.delta",
]);

const TRANSCRIPT_EVENT_TYPES = new Set([
  "conversation.item.added",
  "conversation.item.done",
  "conversation.item.input_audio_transcription.completed",
  "response.output_audio_transcript.delta",
  "response.output_audio_transcript.done",
  "response.done",
]);

const MAX_EVENT_LOG = 100;

export function useRealtimeSession() {
  const [status, setStatus] = useState<SessionStatus>("disconnected");
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [responseStatus, setResponseStatus] = useState<ResponseStatus | null>(
    null
  );
  const [events, setEvents] = useState<RealtimeEventLogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<RealtimeSession | null>(null);
  const recorderRef = useRef<WavRecorder | null>(null);
  const playerRef = useRef<WavStreamPlayer | null>(null);
  const eventIdRef = useRef(0);

  const logEvent = useCallback((type: string, summary?: string) => {
    const entry: RealtimeEventLogEntry = {
      id: (eventIdRef.current += 1),
      type,
      at: Date.now(),
      summary,
    };
    setEvents(prev => [...prev.slice(-(MAX_EVENT_LOG - 1)), entry]);
  }, []);

  const teardown = useCallback(async () => {
    const recorder = recorderRef.current;
    recorderRef.current = null;
    const recorderContext: unknown = recorder?.source?.context;
    try {
      await recorder?.quit();
    } catch {}
    await closeAudioContext(recorderContext);

    const player = playerRef.current;
    playerRef.current = null;
    try {
      await player?.interrupt();
    } catch {}
    await closeAudioContext(player?.context);

    const session = sessionRef.current;
    sessionRef.current = null;
    try {
      session?.close();
    } catch {}

    setIsUserSpeaking(false);
    setIsAssistantSpeaking(false);
    setIsResponding(false);
  }, []);

  const handleTransportEvent = useCallback(
    (event: TransportEvent) => {
      const { type } = event;
      switch (type) {
        case "input_audio_buffer.speech_started":
          setIsUserSpeaking(true);
          break;
        case "input_audio_buffer.speech_stopped":
          setIsUserSpeaking(false);
          break;
        case "session.created":
        case "session.updated": {
          const info = readSessionInfo(event);
          if (info) setSessionInfo(info);
          break;
        }
        case "response.created":
          setIsResponding(true);
          setResponseStatus("in_progress");
          break;
        case "response.done":
          setIsResponding(false);
          setResponseStatus(readResponseStatus(event));
          break;
      }

      if (TRANSCRIPT_EVENT_TYPES.has(type)) {
        setTranscript(prev => {
          const next = updateTranscript(prev, type, event);
          return next === prev ? prev : orderByPreviousItemId(next);
        });
      }

      if (!NOISY_EVENT_TYPES.has(type)) {
        logEvent(type, summarizeEvent(type, event));
      }
    },
    [logEvent]
  );

  const start = useCallback(async () => {
    if (sessionRef.current) return;
    setError(null);
    setTranscript([]);
    setSessionInfo(null);
    setEvents([]);
    setResponseStatus(null);
    eventIdRef.current = 0;
    setStatus("connecting");

    try {
      // The SDK only wires audio for WebRTC, so capture and play PCM16 ourselves over WebSocket.
      const player = new WavStreamPlayer({ sampleRate: AUDIO_SAMPLE_RATE });
      const recorder = new WavRecorder({ sampleRate: AUDIO_SAMPLE_RATE });
      playerRef.current = player;
      recorderRef.current = recorder;
      // Connect the player before any other await so Safari creates its AudioContext within the click.
      await player.connect();
      await recorder.begin();

      const tokenResponse = await fetch("/api/token");
      const body: { value?: string; error?: string } = await tokenResponse
        .json()
        .catch(() => ({}));
      if (!tokenResponse.ok || !body.value) {
        throw new Error(
          body.error ?? `Token request failed (${tokenResponse.status}).`
        );
      }

      const agent = new RealtimeAgent({
        name: "ElevenLabs agent",
        instructions: AGENT_INSTRUCTIONS,
      });
      const session = new RealtimeSession(agent, {
        transport: new OpenAIRealtimeWebSocket({ url: REALTIME_URL }),
        model: REALTIME_MODEL,
        config: {
          outputModalities: ["audio"],
          audio: { output: { voice: REALTIME_VOICE } },
        },
      });
      sessionRef.current = session;

      session.on("audio", event => {
        player.add16BitPCM(event.data, event.responseId);
      });
      session.on("audio_start", () => setIsAssistantSpeaking(true));
      session.on("audio_interrupted", () => {
        player.interrupt();
        setIsAssistantSpeaking(false);
      });
      session.on("audio_stopped", () => setIsAssistantSpeaking(false));
      session.on("error", event => setError(extractErrorMessage(event)));
      session.on("transport_event", handleTransportEvent);
      session.transport.on("connection_change", connectionStatus => {
        if (connectionStatus !== "disconnected") return;
        if (sessionRef.current !== session) return;
        void teardown().then(() => setStatus("disconnected"));
      });

      await session.connect({ apiKey: body.value });

      // wavtools types `mono` as Int16Array, but at runtime it is already the PCM16 ArrayBuffer.
      await recorder.record(data => {
        session.sendAudio(data.mono as unknown as ArrayBuffer);
      });

      setStatus("connected");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      await teardown();
      setStatus("disconnected");
    }
  }, [handleTransportEvent, teardown]);

  const stop = useCallback(async () => {
    await teardown();
    setStatus("disconnected");
  }, [teardown]);

  return {
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
  };
}

async function closeAudioContext(context: unknown) {
  if (!(context instanceof AudioContext) || context.state === "closed") return;
  try {
    await context.close();
  } catch {}
}

function updateTranscript(
  prev: TranscriptEntry[],
  type: string,
  event: TransportEvent
): TranscriptEntry[] {
  const obj = asObject(event);
  switch (type) {
    case "conversation.item.added":
    case "conversation.item.done": {
      const item = getObject(obj, "item");
      const id = getString(item, "id");
      const role = getString(item, "role");
      if (!id || (role !== "user" && role !== "assistant")) return prev;
      const previousItemId = getString(obj, "previous_item_id");
      return upsertTranscript(prev, id, role, entry => ({
        previousItemId: previousItemId ?? entry.previousItemId,
      }));
    }
    case "conversation.item.input_audio_transcription.completed": {
      const id = getString(obj, "item_id");
      if (!id) return prev;
      const text = getString(obj, "transcript") ?? "";
      return upsertTranscript(prev, id, "user", () => ({
        text,
        isFinal: true,
      }));
    }
    case "response.output_audio_transcript.delta": {
      const id = getString(obj, "item_id");
      if (!id) return prev;
      const delta = getString(obj, "delta") ?? "";
      return upsertTranscript(prev, id, "assistant", entry => ({
        text: entry.text + delta,
      }));
    }
    case "response.output_audio_transcript.done": {
      const id = getString(obj, "item_id");
      if (!id) return prev;
      const text = getString(obj, "transcript") ?? "";
      return upsertTranscript(prev, id, "assistant", () => ({
        text,
        isFinal: true,
      }));
    }
    // An interrupted response can end without a transcript.done event.
    case "response.done": {
      if (!prev.some(e => e.role === "assistant" && !e.isFinal)) return prev;
      return prev.map(e =>
        e.role === "assistant" && !e.isFinal ? { ...e, isFinal: true } : e
      );
    }
    default:
      return prev;
  }
}

// Events can arrive out of order, so follow the server's previous_item_id chain.
function orderByPreviousItemId(entries: TranscriptEntry[]): TranscriptEntry[] {
  const ids = new Set(entries.map(entry => entry.id));
  const successorOf = new Map(
    entries
      .filter(entry => entry.previousItemId)
      .map(entry => [entry.previousItemId, entry] as const)
  );

  const ordered: TranscriptEntry[] = [];
  const seen = new Set<string>();
  let cursor = entries.find(
    entry => !entry.previousItemId || !ids.has(entry.previousItemId)
  );
  while (cursor && !seen.has(cursor.id)) {
    seen.add(cursor.id);
    ordered.push(cursor);
    cursor = successorOf.get(cursor.id);
  }
  return [...ordered, ...entries.filter(entry => !seen.has(entry.id))];
}

function upsertTranscript(
  prev: TranscriptEntry[],
  id: string,
  role: TranscriptEntry["role"],
  updater: (entry: TranscriptEntry) => Partial<TranscriptEntry>
): TranscriptEntry[] {
  const index = prev.findIndex(entry => entry.id === id);
  if (index === -1) {
    const base: TranscriptEntry = { id, role, text: "", isFinal: false };
    return [...prev, { ...base, ...updater(base) }];
  }
  return prev.map((entry, i) =>
    i === index ? { ...entry, ...updater(entry) } : entry
  );
}

function readSessionInfo(event: unknown): SessionInfo | null {
  const session = getObject(asObject(event), "session");
  if (!session) return null;
  const audio = getObject(session, "audio");
  return {
    model: getString(session, "model") ?? "unknown",
    voice: getString(getObject(audio, "output"), "voice"),
    turnDetection: getString(
      getObject(getObject(audio, "input"), "turn_detection"),
      "type"
    ),
  };
}

function readResponseStatus(event: unknown): ResponseStatus {
  const status = getString(getObject(asObject(event), "response"), "status");
  return isResponseStatus(status) ? status : "completed";
}

function isResponseStatus(value: string | null): value is ResponseStatus {
  return value !== null && RESPONSE_STATUSES.has(value);
}

function summarizeEvent(type: string, event: unknown): string | undefined {
  switch (type) {
    case "session.created":
    case "session.updated": {
      const info = readSessionInfo(event);
      return info ? `${info.model} · ${info.voice ?? "default"}` : undefined;
    }
    case "conversation.item.input_audio_transcription.completed":
    case "response.output_audio_transcript.done":
      return getString(asObject(event), "transcript") ?? undefined;
    case "response.done":
      return readResponseStatus(event);
    default:
      return undefined;
  }
}

function extractErrorMessage(value: unknown, depth = 0): string {
  if (value == null) return "Unknown error";
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.message;
  const obj = asObject(value);
  if (!obj) return String(value);
  const message = getString(obj, "message") ?? getString(obj, "reason");
  if (message) return message;
  if ("error" in obj && depth < 5) {
    return extractErrorMessage(obj.error, depth + 1);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return "Unknown error";
  }
}

function asObject(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function getObject(
  obj: Record<string, unknown> | null,
  key: string
): Record<string, unknown> | null {
  return asObject(obj?.[key]);
}

function getString(
  obj: Record<string, unknown> | null,
  key: string
): string | null {
  const value = obj?.[key];
  return typeof value === "string" ? value : null;
}
