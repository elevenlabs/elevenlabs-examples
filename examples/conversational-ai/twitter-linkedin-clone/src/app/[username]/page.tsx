"use client";

import { use, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useResearch } from "@/hooks/useResearch";
import { useVoice } from "@/hooks/useVoice";
import { useAgent } from "@/hooks/useAgent";
import { ProgressSteps, StatusSection } from "@/components/ProfilePage";
import { createProfileInfo } from "@/utils/profileUtils";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const searchParams = useSearchParams();
  const platform = searchParams.get("platform") || "twitter";

  // Memoize profileInfo to prevent infinite loops
  const profileInfo = useMemo(
    () => createProfileInfo(username, platform),
    [username, platform]
  );

  const researchState = useResearch(profileInfo);
  const { voiceState, handleVoiceRecorded, setVoiceId } = useVoice();
  const { agentState, createAgent } = useAgent(profileInfo, setVoiceId);

  // Voice recording handler
  const onVoiceRecorded = (audioBlob: Blob) => {
    handleVoiceRecorded(audioBlob);
  };

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
    <div className="w-full max-w-4xl mx-auto space-y-3 sm:space-y-4 pb-6 sm:pb-8">
      {/* Header Card */}
      <Card className="bg-white/80 backdrop-blur-[16px] shadow-xl border border-gray-200/50">
        <CardHeader className="p-4 sm:pb-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold">
                {profileInfo.displayName}
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {profileInfo.type === "linkedin"
                  ? "LinkedIn Profile"
                  : "Twitter/X Profile"}
              </p>
            </div>
            <div className="flex flex-row gap-2 sm:gap-3">
              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm touch-manipulation"
                >
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                  <span className="hidden xs:inline sm:inline">Back</span>
                  <span className="xs:hidden">←</span>
                </Button>
              </Link>
              <Link
                href={profileInfo.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm touch-manipulation"
                >
                  <span className="hidden sm:inline">View Profile</span>
                  <span className="sm:hidden">Profile</span>
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 sm:ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Steps */}
      <Card className="bg-white/80 backdrop-blur-[16px] shadow-xl border border-gray-200/50">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <ProgressSteps
            researchState={researchState}
            voiceState={voiceState}
            agentState={agentState}
            profileInfo={profileInfo}
          />
        </CardContent>
      </Card>

      {/* Status Section */}
      <Card className="bg-white/80 backdrop-blur-[16px] shadow-xl border border-gray-200/50">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <StatusSection
            researchState={researchState}
            voiceState={voiceState}
            agentState={agentState}
            profileIdentifier={profileInfo.identifier}
            onVoiceRecorded={onVoiceRecorded}
          />
        </CardContent>
      </Card>
    </div>
  );
}
