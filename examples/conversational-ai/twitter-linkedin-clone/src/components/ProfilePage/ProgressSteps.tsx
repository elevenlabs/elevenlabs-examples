"use client";

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
    <div className="mb-12">
      <div className="flex justify-center items-center gap-8 mb-8">
        {/* Step 1: Record Voice */}
        <div className="flex items-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-2 flex-shrink-0 ${
              voiceState.isRecorded
                ? "bg-green-100 text-green-600 border-green-200"
                : "bg-blue-100 text-blue-600 border-blue-200"
            }`}
          >
            {voiceState.isRecorded ? "✓" : "🎤"}
          </div>
          <div className="ml-4">
            <div className="text-lg font-semibold text-black whitespace-nowrap">
              Record Voice
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="text-gray-400 text-2xl">→</div>

        {/* Step 2: Research Profile */}
        <div className="flex items-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-2 flex-shrink-0 ${
              researchState.isComplete
                ? "bg-green-100 text-green-600 border-green-200"
                : researchState.phase
                ? "bg-blue-100 text-blue-600 border-blue-200"
                : "bg-gray-100 text-gray-400 border-gray-200"
            }`}
          >
            {researchState.isComplete ? "✓" : "🔍"}
          </div>
          <div className="ml-4">
            <div className="text-lg font-semibold text-black">
              Research Profile
            </div>
            <div className="text-sm text-gray-600 whitespace-nowrap">
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
        <div className="text-gray-400 text-2xl">→</div>

        {/* Step 3: Create AI Twin */}
        <div className="flex items-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-2 flex-shrink-0 ${
              agentState.agentId
                ? "bg-green-100 text-green-600 border-green-200"
                : agentState.isCreating
                ? "bg-blue-100 text-blue-600 border-blue-200"
                : "bg-gray-100 text-gray-400 border-gray-200"
            }`}
          >
            {agentState.agentId ? "✓" : "🤖"}
          </div>
          <div className="ml-4">
            <div className="text-lg font-semibold text-black whitespace-nowrap">
              Create AI Twin
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
