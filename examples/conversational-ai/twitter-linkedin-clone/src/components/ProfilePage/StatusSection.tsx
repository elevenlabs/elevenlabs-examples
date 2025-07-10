"use client";

import Link from "next/link";
import { Sparkles, Check } from "lucide-react";
import { ResearchState, VoiceState, AgentCreationState } from "@/types/profile";
import VoiceRecorder from "@/components/VoiceRecorder";
import { Button } from "@/components/ui/button";

interface StatusSectionProps {
  researchState: ResearchState;
  voiceState: VoiceState;
  agentState: AgentCreationState;
  profileIdentifier: string;
  onVoiceRecorded: (audioBlob: Blob) => void;
}

export const StatusSection = ({
  researchState,
  voiceState,
  agentState,
  profileIdentifier,
  onVoiceRecorded,
}: StatusSectionProps) => {
  // Voice Recording
  if (!voiceState.isRecorded && !agentState.agentId) {
    return (
      <div className="text-center px-3 sm:px-0">
        <VoiceRecorder
          username={profileIdentifier}
          onRecordingComplete={onVoiceRecorded}
        />
        {voiceState.error && (
          <p className="text-destructive text-center mt-3 sm:mt-4 text-xs sm:text-sm">
            {voiceState.error}
          </p>
        )}
      </div>
    );
  }

  // Error handling
  if ((researchState.error || voiceState.error) && !agentState.agentId) {
    return (
      <div className="text-center px-3 sm:px-0">
        <p className="text-destructive mb-3 sm:mb-4 text-sm sm:text-base">
          {researchState.error || voiceState.error}
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="destructive"
          className="h-9 sm:h-10 px-4 sm:px-6 text-sm sm:text-base touch-manipulation"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Agent Creation Status
  if (agentState.isCreating) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-primary mx-auto mb-4 sm:mb-6"></div>
        <h2 className="text-lg sm:text-xl font-bold mb-2">Creating AI Twin</h2>
        <p className="text-muted-foreground text-xs sm:text-sm px-4">
          Combining your voice with research data...
        </p>
      </div>
    );
  }

  // Success - Agent Ready
  if (agentState.agentId) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 flex justify-center">
          <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
          AI Twin Ready!
        </h2>
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-lg sm:text-xl font-bold">
              <Check className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-sm sm:text-base">
                Ready to Chat
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Start conversations with your AI twin
              </p>
            </div>
          </div>
        </div>
        <Link href={`/chat/${agentState.agentId}`}>
          <Button
            size="lg"
            className="text-base sm:text-lg h-10 sm:h-12 px-6 sm:px-8 touch-manipulation"
          >
            Start Conversation
          </Button>
        </Link>
      </div>
    );
  }

  // Agent Error
  if (agentState.error) {
    return (
      <div className="text-center px-3 sm:px-0">
        <p className="text-destructive text-sm sm:text-lg">
          {agentState.error}
        </p>
      </div>
    );
  }

  return null;
};
