import {
  ConversationProvider,
  useConversation,
} from "@elevenlabs/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TranscriptLine = {
  id: string;
  role: "user" | "agent";
  text: string;
  tentative: boolean;
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

function VoiceAgentContent() {
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

  const onMessage = useCallback((event: unknown) => {
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

  const onDebug = useCallback((event: unknown) => {
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

  const conversation = useConversation({
    onMessage,
    onDebug,
    onError: (e: unknown) => {
      setSessionError(e instanceof Error ? e.message : String(e));
    },
    onDisconnect: () => {
      setStarting(false);
    },
  });

  const trimmedId = agentIdInput.trim();
  const canStart = trimmedId.length > 0 && !starting;

  useEffect(() => {
    if (!trimmedId) {
      setAgentLookupOk(false);
      setAgentLookupError(null);
      return;
    }

    if (lookupTimer.current) clearTimeout(lookupTimer.current);
    lookupTimer.current = setTimeout(async () => {
      setAgentLookupError(null);
      setAgentLookupOk(false);
      try {
        const res = await fetch(
          `/api/agent?agentId=${encodeURIComponent(trimmedId)}`,
        );
        const data = await res.json();
        if (!res.ok) {
          setAgentLookupError(
            typeof data.error === "string" ? data.error : "Agent lookup failed",
          );
          return;
        }
        setAgentLookupOk(true);
      } catch {
        setAgentLookupError("Network error while loading agent.");
      }
    }, 450);

    return () => {
      if (lookupTimer.current) clearTimeout(lookupTimer.current);
    };
  }, [trimmedId]);

  const statusLabel = useMemo(() => {
    switch (conversation.status) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting…";
      case "disconnected":
        return "Disconnected";
      case "error":
        return "Error";
      default:
        return conversation.status;
    }
  }, [conversation.status]);

  async function handleCreateAgent() {
    setCreateError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/agent", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(
          typeof data.error === "string" ? data.error : "Failed to create agent",
        );
        return;
      }
      const id = data.agentId as string;
      setAgentIdInput(id);
      setAgentLookupOk(true);
      setAgentLookupError(null);
    } catch {
      setCreateError("Network error while creating agent.");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleSession() {
    setSessionError(null);

    if (
      conversation.status === "connected" ||
      conversation.status === "connecting"
    ) {
      await conversation.endSession();
      setStarting(false);
      return;
    }

    const id = agentIdInput.trim();
    if (!id) return;

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
        `/api/conversation-token?agentId=${encodeURIComponent(id)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setSessionError(
          typeof data.error === "string"
            ? data.error
            : "Could not get signed URL.",
        );
        setStarting(false);
        return;
      }
      const signedUrl = data.signedUrl as string;
      await conversation.startSession({ signedUrl });
    } catch (e) {
      setSessionError(e instanceof Error ? e.message : String(e));
    } finally {
      setStarting(false);
    }
  }

  const sessionActive =
    conversation.status === "connected" ||
    conversation.status === "connecting";

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.headerBlock}>
          <Text style={styles.eyebrow}>Expo Template</Text>
          <Text style={styles.title}>Voice agent</Text>
          <Text style={styles.description}>
            Talk in real time with an ElevenLabs conversational agent.
            Use Create agent or paste an existing agent id, then Start.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.label}>Agent id</Text>
              <TextInput
                accessibilityLabel="Agent id"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Paste or create an agent id"
                placeholderTextColor="#a3a3a3"
                style={styles.input}
                value={agentIdInput}
                onChangeText={setAgentIdInput}
              />
              {agentLookupError ? (
                <Text style={styles.errorSmall}>{agentLookupError}</Text>
              ) : trimmedId && agentLookupOk ? (
                <Text style={styles.hint}>Agent found.</Text>
              ) : null}
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={creating}
              onPress={handleCreateAgent}
              style={({ pressed }) => [
                styles.buttonSecondary,
                (pressed || creating) && styles.buttonPressed,
              ]}
            >
              {creating ? (
                <ActivityIndicator color="#171717" />
              ) : (
                <Text style={styles.buttonSecondaryText}>Create agent</Text>
              )}
            </Pressable>
          </View>

          {createError ? (
            <Text style={styles.errorText}>{createError}</Text>
          ) : null}

          <View style={styles.controlsRow}>
            <Pressable
              accessibilityRole="button"
              disabled={!sessionActive && !canStart}
              onPress={handleToggleSession}
              style={({ pressed }) => [
                styles.buttonPrimary,
                !sessionActive && !canStart && styles.buttonMuted,
                pressed && sessionActive && styles.buttonPressedOpacity,
              ]}
            >
              <Text style={styles.buttonPrimaryText}>
                {sessionActive ? "Stop" : starting ? "Starting…" : "Start"}
              </Text>
            </Pressable>
            <Text style={styles.status}>
              Status: {statusLabel}
            </Text>
          </View>

          {sessionError ? (
            <Text style={styles.errorText}>{sessionError}</Text>
          ) : null}

          <View style={styles.transcriptBlock}>
            <Text style={styles.label}>Transcript</Text>
            <ScrollView
              accessibilityLabel="Conversation transcript"
              style={styles.transcriptScroll}
            >
              {lines.length === 0 ? (
                <Text style={styles.muted}>
                  {sessionActive
                    ? "Listening…"
                    : "Start a session to see the conversation here."}
                </Text>
              ) : (
                lines.map(line => (
                  <Text key={line.id} style={styles.transcriptLine}>
                    <Text
                      style={
                        line.role === "user"
                          ? styles.transcriptYou
                          : styles.transcriptAgent
                      }
                    >
                      {line.role === "user" ? "You" : "Agent"}
                    </Text>
                    <Text
                      style={
                        line.tentative
                          ? styles.transcriptTentative
                          : styles.transcriptBody
                      }
                    >
                      : {line.text}
                    </Text>
                  </Text>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function HomeScreen() {
  return (
    <ConversationProvider
      onError={(error) => {
        console.error("Conversation error:", error);
      }}
    >
      <VoiceAgentContent />
    </ConversationProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 672,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  headerBlock: {
    marginBottom: 8,
  },
  eyebrow: {
    color: "#525252",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 12,
    color: "#171717",
    fontSize: 28,
    fontWeight: "600",
    letterSpacing: -0.5,
  },
  description: {
    marginTop: 8,
    color: "#737373",
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    marginTop: 32,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: 12,
  },
  field: {
    flex: 1,
    minWidth: 200,
  },
  label: {
    fontSize: 12,
    color: "#a3a3a3",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#171717",
    backgroundColor: "#ffffff",
  },
  hint: {
    marginTop: 4,
    fontSize: 12,
    color: "#a3a3a3",
  },
  errorSmall: {
    marginTop: 4,
    fontSize: 12,
    color: "#dc2626",
  },
  buttonSecondary: {
    marginTop: 22,
    minHeight: 40,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
  },
  buttonSecondaryText: {
    color: "#171717",
    fontSize: 14,
    fontWeight: "500",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: "#dc2626",
  },
  controlsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 20,
    gap: 12,
  },
  buttonPrimary: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: "#171717",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonMuted: {
    opacity: 0.5,
  },
  buttonPressedOpacity: {
    opacity: 0.85,
  },
  buttonPrimaryText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  status: {
    fontSize: 12,
    color: "#a3a3a3",
  },
  transcriptBlock: {
    marginTop: 24,
  },
  transcriptScroll: {
    maxHeight: 400,
    marginTop: 8,
    paddingTop: 4,
  },
  muted: {
    fontSize: 14,
    color: "#737373",
  },
  transcriptLine: {
    fontSize: 14,
    marginBottom: 8,
  },
  transcriptYou: {
    fontWeight: "600",
    color: "#171717",
  },
  transcriptAgent: {
    fontWeight: "600",
    color: "#404040",
  },
  transcriptBody: {
    color: "#262626",
  },
  transcriptTentative: {
    color: "#a3a3a3",
    fontStyle: "italic",
  },
});
