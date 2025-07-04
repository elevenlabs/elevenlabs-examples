"use client";

import Link from "next/link";
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
      <div className="text-center">
        <VoiceRecorder
          username={profileIdentifier}
          onRecordingComplete={onVoiceRecorded}
        />
        {voiceState.error && (
          <p className="text-destructive text-center mt-4">
            {voiceState.error}
          </p>
        )}
      </div>
    );
  }

  // Error handling
  if ((researchState.error || voiceState.error) && !agentState.agentId) {
    return (
      <div className="text-center">
        <p className="text-destructive mb-4">
          {researchState.error || voiceState.error}
        </p>
        <Button onClick={() => window.location.reload()} variant="destructive">
          Try Again
        </Button>
      </div>
    );
  }

  // Agent Creation Status
  if (agentState.isCreating) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
        <h2 className="text-xl font-bold mb-2">Creating AI Twin</h2>
        <p className="text-muted-foreground">
          Combining your voice with research data...
        </p>
      </div>
    );
  }

  // Success - Agent Ready
  if (agentState.agentId) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-2xl font-bold mb-4">AI Twin Ready!</h2>
        <div className="mb-6">
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xl font-bold">
              ✓
            </div>
            <div className="text-left">
              <h3 className="font-medium">Ready to Chat</h3>
              <p className="text-sm text-muted-foreground">
                Start conversations with your AI twin
              </p>
            </div>
          </div>
        </div>
        <Link href={`/chat/${agentState.agentId}`}>
          <Button size="lg" className="text-lg">
            Start Conversation
          </Button>
        </Link>
      </div>
    );
  }

  // Agent Error
  if (agentState.error) {
    return (
      <div className="text-center">
        <p className="text-destructive text-lg">{agentState.error}</p>
      </div>
    );
  }

  return null;
};
