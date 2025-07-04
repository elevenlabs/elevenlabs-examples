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
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-8">
      {/* Header Card */}
      <Card className="bg-white/80 backdrop-blur-[16px] shadow-xl border border-gray-200/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="text-2xl sm:text-3xl font-bold">
                {profileInfo.displayName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {profileInfo.type === "linkedin"
                  ? "LinkedIn Profile"
                  : "Twitter/X Profile"}
              </p>
            </div>
            <div className="flex flex-row gap-2 sm:gap-3">
              <Link href="/">
                <Button variant="outline" size="sm" className="h-9">
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              </Link>
              <Link
                href={profileInfo.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="default" size="sm" className="h-9">
                  <span className="hidden sm:inline">View Profile</span>
                  <span className="sm:hidden">Profile</span>
                  <ExternalLink className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Steps */}
      <Card className="bg-white/80 backdrop-blur-[16px] shadow-xl border border-gray-200/50">
        <CardContent className="p-4 sm:p-6">
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
        <CardContent className="p-4 sm:p-6">
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
