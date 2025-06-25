"use client";

import { useState, useEffect } from "react";
import { ResearchState, ProfileInfo } from "@/types/profile";
import { getProfilePrompt } from "@/utils/profileUtils";

export const useResearch = (profileInfo: ProfileInfo) => {
  const [researchState, setResearchState] = useState<ResearchState>({
    phase: null,
    progress: 0,
    knowledgeBaseId: null,
    isComplete: false,
    error: null,
  });

  useEffect(() => {
    const runCompleteResearch = async () => {
      try {
        // Phase 1: Profile Analysis (0-25%)
        setResearchState({
          phase: "profile",
          progress: 0,
          knowledgeBaseId: null,
          isComplete: false,
          error: null,
        });

        const profileResponse = await fetch("/api/perplexity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content:
                  "You are conducting research for creating an authentic digital representation. Be thorough, analytical, and comprehensive. Include specific quotes, exact details, and concrete examples wherever possible.",
              },
              { role: "user", content: getProfilePrompt(profileInfo) },
            ],
            stream: false,
          }),
        });

        if (!profileResponse.ok) {
          throw new Error("Failed to fetch profile summary");
        }

        const profileData = await profileResponse.json();
        const profileContent = profileData.choices?.[0]?.message?.content;

        if (!profileContent) {
          throw new Error("No profile content received");
        }

        setResearchState((prev) => ({ ...prev, progress: 25 }));

        // Phase 2: Topic Analysis (25-40%)
        setResearchState((prev) => ({
          ...prev,
          phase: "topics",
          progress: 25,
        }));

        const topicsResponse = await fetch("/api/analyze-topics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileSummary: profileContent,
            profileInfo: profileInfo,
          }),
        });

        if (!topicsResponse.ok) {
          throw new Error("Failed to analyze topics");
        }

        const topicsData = await topicsResponse.json();
        setResearchState((prev) => ({ ...prev, progress: 40 }));

        // Phase 3: Targeted Research (40-70%)
        setResearchState((prev) => ({
          ...prev,
          phase: "research",
          progress: 40,
        }));

        const researchResponse = await fetch("/api/targeted-research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topics: topicsData.topics,
            profileInfo: profileInfo,
          }),
        });

        if (!researchResponse.ok) {
          throw new Error("Failed to conduct targeted research");
        }

        const researchData = await researchResponse.json();
        setResearchState((prev) => ({ ...prev, progress: 70 }));

        // Phase 4: Knowledge Base Creation (70-100%)
        setResearchState((prev) => ({
          ...prev,
          phase: "knowledge",
          progress: 70,
        }));

        const knowledgeResponse = await fetch("/api/elevenlabs/knowledge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: profileContent,
            profileInfo: profileInfo,
            targetedResearch: researchData.targetedResearch,
          }),
        });

        if (!knowledgeResponse.ok) {
          throw new Error("Failed to create knowledge base");
        }

        const knowledgeData = await knowledgeResponse.json();

        // Research complete!
        setResearchState({
          phase: "complete",
          progress: 100,
          knowledgeBaseId: knowledgeData.id,
          isComplete: true,
          error: null,
        });
      } catch (error) {
        console.error("Research error:", error);
        setResearchState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Research failed",
          isComplete: false,
        }));
      }
    };

    runCompleteResearch();
  }, [profileInfo]);

  return researchState;
};
