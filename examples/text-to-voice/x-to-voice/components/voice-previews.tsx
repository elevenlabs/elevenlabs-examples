"use client";

import { Button } from "@/components/ui/button";
import { DownloadIcon, PauseCircle, PlayCircle } from "lucide-react";
import { useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function VoicePreviews({ voicePreviews }: { voicePreviews: any }) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const handlePlayPause = (index: number, audioElement: HTMLAudioElement) => {
    if (playingIndex === index) {
      audioElement.pause();
      setPlayingIndex(null);
    } else {
      // Stop any currently playing audio
      if (playingIndex !== null) {
        const prevAudio = document.querySelector(
          `#audio-${playingIndex}`,
        ) as HTMLAudioElement;
        prevAudio?.pause();
      }
      audioElement.play();
      setPlayingIndex(index);
    }
  };

  return (
    <div className="space-y-2">
      {voicePreviews.map((previewUrl, index) => (
          <div
            key={previewUrl}
            className="flex items-center text-sm text-gray-700 border border-gray-200 rounded p-2"
          >
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 mr-2"
              onClick={() => {
                const audio = document.querySelector(
                  `#audio-${index}`,
                ) as HTMLAudioElement;
                handlePlayPause(index, audio);
              }}
            >
              {playingIndex === index ? (
                <PauseCircle className="w-4 h-4" />
              ) : (
                <PlayCircle className="w-4 h-4" />
              )}
            </Button>
            <span>Voice sample {index + 1}</span>
            <audio
              id={`audio-${index}`}
              src={previewUrl}
              onEnded={() => setPlayingIndex(null)}
            />
            <a
              href={previewUrl}
              download={`voice-sample-${index + 1}.mp4`}
              target="_blank"
              className={"ml-auto"}
            >
              <Button variant="ghost" size="sm">
                <DownloadIcon className="w-4 h-4"></DownloadIcon>
              </Button>
            </a>

          </div>
        ),
      )}
    </div>
  );
}
