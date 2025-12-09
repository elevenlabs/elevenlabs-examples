"use client";

import { Mic, Search, Bot, Check } from "lucide-react";
import {
  ResearchState,
  VoiceState,
  AgentCreationState,
  ProfileInfo,
} from "@/types/profile";
import { AnimatedResearchTitle } from "./AnimatedResearchTitle";

interface ProgressStepsProps {
  researchState: ResearchState;
  voiceState: VoiceState;
  agentState: AgentCreationState;
  profileInfo: ProfileInfo;
}

export const ProgressSteps = ({
  researchState,
  voiceState,
  agentState,
  profileInfo,
}: ProgressStepsProps) => {
  if (agentState.agentId) return null;

  return (
    <div className="">
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
        {/* Step 1: Record Voice */}
        <div className="flex items-center w-full sm:w-auto">
          <div
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold border-2 flex-shrink-0 ${
              voiceState.isRecorded
                ? "bg-green-100 text-green-600 border-green-200"
                : "bg-primary/10 text-primary border-primary/20"
            }`}
          >
            {voiceState.isRecorded ? (
              <Check className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </div>
          <div className="ml-3 sm:ml-4">
            <div className="text-base sm:text-lg font-semibold whitespace-nowrap">
              Record Voice
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="text-muted-foreground text-lg sm:text-2xl rotate-90 sm:rotate-0">
          →
        </div>

        {/* Step 2: Research Profile */}
        <div className="flex items-center w-full sm:w-auto">
          <div
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold border-2 flex-shrink-0 ${
              researchState.isComplete
                ? "bg-green-100 text-green-600 border-green-200"
                : researchState.phase
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-muted text-muted-foreground border-muted-foreground/20"
            }`}
          >
            {researchState.isComplete ? (
              <Check className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </div>
          <div className="ml-3 sm:ml-4">
            <div className="text-base sm:text-lg font-semibold">
              Research Profile
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              <AnimatedResearchTitle
                phase={researchState.phase}
                platform={
                  profileInfo.type === "linkedin" ? "LinkedIn" : "Twitter/X"
                }
              />
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="text-muted-foreground text-lg sm:text-2xl rotate-90 sm:rotate-0">
          →
        </div>

        {/* Step 3: Create AI Twin */}
        <div className="flex items-center w-full sm:w-auto">
          <div
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold border-2 flex-shrink-0 ${
              agentState.agentId
                ? "bg-green-100 text-green-600 border-green-200"
                : agentState.isCreating
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-muted text-muted-foreground border-muted-foreground/20"
            }`}
          >
            {agentState.agentId ? (
              <Check className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </div>
          <div className="ml-3 sm:ml-4">
            <div className="text-base sm:text-lg font-semibold whitespace-nowrap">
              Create AI Twin
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
