"use client";

import { useState, useEffect } from "react";
import { AnimatedEllipsis } from "./AnimatedEllipsis";

interface AnimatedResearchTitleProps {
  phase: string | null;
  platform: string;
}

export const AnimatedResearchTitle = ({
  phase,
  platform,
}: AnimatedResearchTitleProps) => {
  const [currentTitle, setCurrentTitle] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const titles = [
    `Analyzing ${platform} Profile`,
    "Identifying Key Topics",
    "Deep Research & Analysis",
    "Building Knowledge Base",
  ];

  const phaseToIndex = {
    profile: 0,
    topics: 1,
    research: 2,
    knowledge: 3,
    complete: 3,
  };

  const targetIndex = phase
    ? phaseToIndex[phase as keyof typeof phaseToIndex] ?? 0
    : 0;

  useEffect(() => {
    if (targetIndex !== currentTitle) {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentTitle(targetIndex);
        setIsVisible(true);
      }, 300);
    }
  }, [targetIndex, currentTitle]);

  return (
    <div className="overflow-hidden">
      <div
        className={`transition-all duration-300 transform whitespace-nowrap ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        {titles[currentTitle]}
        {phase && phase !== "complete" && <AnimatedEllipsis />}
      </div>
    </div>
  );
};
