"use client";

import { useState, useCallback } from "react";
import { AgentCreationState, ProfileInfo } from "@/types/profile";

export const useAgent = (
  profileInfo: ProfileInfo,
  setVoiceId: (voiceId: string) => void
) => {
  const [agentState, setAgentState] = useState<AgentCreationState>({
    isCreating: false,
    agentId: null,
    error: null,
  });

  const createAgent = useCallback(
    async (audioBlob: Blob, knowledgeBaseId: string) => {
      setAgentState({ isCreating: true, agentId: null, error: null });

      try {
        // Step 1: Create voice clone
        const voiceFormData = new FormData();
        voiceFormData.append("audio", audioBlob, "voice-recording.webm");
        voiceFormData.append("name", `${profileInfo.displayName} Voice Clone`);

        const voiceResponse = await fetch("/api/elevenlabs/voice", {
          method: "POST",
          body: voiceFormData,
        });

        if (!voiceResponse.ok) {
          throw new Error("Failed to create voice clone");
        }

        const voiceData = await voiceResponse.json();
        const voiceId = voiceData.voice_id;
        setVoiceId(voiceId);

        // Step 2: Create agent
        const agentResponse = await fetch("/api/elevenlabs/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            voiceId,
            knowledgeBaseId,
            profileInfo: profileInfo,
            profileSummary: "", // Not needed as it's in knowledge base
          }),
        });

        if (!agentResponse.ok) {
          throw new Error("Failed to create agent");
        }

        const agentData = await agentResponse.json();
        setAgentState({
          isCreating: false,
          agentId: agentData.agent_id,
          error: null,
        });
      } catch (error) {
        console.error("Agent creation error:", error);
        setAgentState({
          isCreating: false,
          agentId: null,
          error:
            error instanceof Error ? error.message : "Failed to create agent",
        });
      }
    },
    [profileInfo, setVoiceId]
  );

  return {
    agentState,
    createAgent,
  };
};
