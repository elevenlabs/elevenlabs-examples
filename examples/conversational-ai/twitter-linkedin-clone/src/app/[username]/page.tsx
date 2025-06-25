"use client";

import { useEffect, useCallback, use, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createProfileInfo } from "@/utils/profileUtils";
import { useResearch, useVoice, useAgent } from "@/hooks";
import { ProgressSteps, StatusSection } from "@/components/ProfilePage";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const searchParams = useSearchParams();
  const platform = searchParams.get("platform") || "twitter";

  // Create profile info - memoized to prevent re-creation
  const profileInfo = useMemo(
    () => createProfileInfo(username, platform),
    [platform, username]
  );

  // Use custom hooks for state management
  const researchState = useResearch(profileInfo);
  const { voiceState, handleVoiceRecorded, setVoiceId } = useVoice();
  const { agentState, createAgent } = useAgent(profileInfo, setVoiceId);

  // Handle voice recording and trigger agent creation if research is complete
  const onVoiceRecorded = useCallback(
    async (audioBlob: Blob) => {
      handleVoiceRecorded(audioBlob);

      // If research is complete, create agent immediately
      if (researchState.isComplete && researchState.knowledgeBaseId) {
        await createAgent(audioBlob, researchState.knowledgeBaseId);
      }
    },
    [
      handleVoiceRecorded,
      researchState.isComplete,
      researchState.knowledgeBaseId,
      createAgent,
    ]
  );

  // Create agent when both voice and research are ready
  useEffect(() => {
    if (
      researchState.isComplete &&
      researchState.knowledgeBaseId &&
      voiceState.isRecorded &&
      voiceState.audioBlob &&
      !agentState.agentId &&
      !agentState.isCreating
    ) {
      createAgent(voiceState.audioBlob, researchState.knowledgeBaseId);
    }
  }, [
    researchState.isComplete,
    researchState.knowledgeBaseId,
    voiceState.isRecorded,
    voiceState.audioBlob,
    agentState.agentId,
    agentState.isCreating,
    createAgent,
  ]);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-black mb-2">
            {profileInfo.displayName}
          </h1>
          <div className="flex gap-4 justify-center">
            <Link
              href={profileInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View Profile
            </Link>
            <Link href="/" className="text-blue-600 hover:underline">
              ← Back
            </Link>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {profileInfo.type === "linkedin"
              ? "LinkedIn Profile"
              : "Twitter/X Profile"}
          </p>
        </div>

        {/* Progress Steps */}
        <ProgressSteps
          researchState={researchState}
          voiceState={voiceState}
          agentState={agentState}
          profileInfo={profileInfo}
        />

        {/* Status Section */}
        <StatusSection
          researchState={researchState}
          voiceState={voiceState}
          agentState={agentState}
          profileIdentifier={profileInfo.identifier}
          onVoiceRecorded={onVoiceRecorded}
        />
      </div>
    </div>
  );
}
