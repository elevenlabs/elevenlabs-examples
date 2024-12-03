"use client";

import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Vinyl({
  isPlaying,
  togglePlay,
}: {
  isPlaying: boolean;
  togglePlay: () => void;
}) {
  return (
    <div className="relative">
      <div
        className={cn(
          `w-[70px] h-[70px] rounded-full bg-gradient-to-r from-black/10 to-white/10 origin-center`,
          isPlaying && "animate-spin [animation-duration:3s]"
        )}
      >
        <div className="absolute inset-[30%] rounded-full bg-gray-300" />
      </div>

      <Button
        size="icon"
        onClick={() => togglePlay()}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/60 flex-shrink-0"
      >
        {isPlaying ? <Pause /> : <Play />}
      </Button>
    </div>
  );
}
