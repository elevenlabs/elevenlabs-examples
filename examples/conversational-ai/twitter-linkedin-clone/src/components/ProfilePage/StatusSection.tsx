"use client";

import Link from "next/link";
import { ResearchState, VoiceState, AgentCreationState } from "@/types/profile";
import VoiceRecorder from "@/components/VoiceRecorder";

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
      <div className="mb-6">
        <VoiceRecorder
          username={profileIdentifier}
          onRecordingComplete={onVoiceRecorded}
        />
        {voiceState.error && (
          <p className="text-red-600 text-center mt-1">{voiceState.error}</p>
        )}
      </div>
    );
  }

  // Error handling
  if ((researchState.error || voiceState.error) && !agentState.agentId) {
    return (
      <div className="mb-8 text-center">
        <p className="text-red-600 mb-2">
          {researchState.error || voiceState.error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Agent Creation Status
  if (agentState.isCreating) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
        <h2 className="text-xl font-bold text-black mb-2">Creating AI Twin</h2>
        <p className="text-black">Combining your voice with research data...</p>
      </div>
    );
  }

  // Success - Agent Ready
  if (agentState.agentId) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-2xl font-bold text-black mb-4">AI Twin Ready!</h2>
        <div className="mb-6">
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xl font-bold">
              ✓
            </div>
            <div className="text-left">
              <h3 className="font-medium text-black">Ready to Chat</h3>
              <p className="text-sm text-gray-600">
                Start conversations with your AI twin
              </p>
            </div>
          </div>
        </div>
        <Link
          href={`/chat/${agentState.agentId}`}
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700"
        >
          Start Conversation
        </Link>
      </div>
    );
  }

  // Agent Error
  if (agentState.error) {
    return (
      <div className="text-center">
        <p className="text-red-600 text-lg">{agentState.error}</p>
      </div>
    );
  }

  return null;
};
