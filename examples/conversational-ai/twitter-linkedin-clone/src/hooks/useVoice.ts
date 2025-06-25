"use client";

import { useState } from "react";
import { VoiceState } from "@/types/profile";

export const useVoice = () => {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isRecorded: false,
    voiceId: null,
    audioBlob: null,
    error: null,
  });

  const handleVoiceRecorded = (audioBlob: Blob) => {
    setVoiceState({
      isRecorded: true,
      voiceId: null,
      audioBlob,
      error: null,
    });
  };

  const setVoiceId = (voiceId: string) => {
    setVoiceState((prev) => ({ ...prev, voiceId }));
  };

  const setVoiceError = (error: string) => {
    setVoiceState((prev) => ({ ...prev, error }));
  };

  return {
    voiceState,
    handleVoiceRecorded,
    setVoiceId,
    setVoiceError,
  };
};
