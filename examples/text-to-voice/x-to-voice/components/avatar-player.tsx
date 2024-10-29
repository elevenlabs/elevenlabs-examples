"use client";

import { useEffect, useRef, useState } from "react";
import { DownloadIcon, PauseIcon, PlayIcon, Volume2Icon, VolumeOffIcon } from "lucide-react";
import { ScrambleText } from "@/components/voice-generator-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AvatarPlayer({ jobId }: {
  jobId: string,
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true); // Track if the video is playing
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const toggleMuted = () => {
    if (!videoRef.current) {
      return;
    }
    if (!isMuted) {
      videoRef.current.muted = true;
      setIsMuted(true);
    } else {
      videoRef.current.muted = false;
      videoRef.current.volume = 0.5;
      setIsMuted(false);
    }
  };

  const toggleVideo = () => {
    if (!videoRef.current) {
      return;
    }
    if (!isPlaying) {
      videoRef.current.play().then(() => setIsPlaying(true)) // Set state to playing if playback is successful
        .catch(error => console.error("Error playing video:", error));
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  let intervalId: number | undefined = undefined;

  async function fetchCharacter() {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/character/${jobId}`);
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      if (!data.videoUrl) {
        throw Error("Video url not available");
      }
      setVideoUrl(data.videoUrl);
      setIsLoading(false);
    } catch {
      intervalId = window.setTimeout(fetchCharacter, 2000);
    }
  }

  useEffect(() => {
    void fetchCharacter();
    return () => window.clearTimeout(intervalId); // Clear interval on component unmount
  }, [jobId]);

  return (
    <div className={"flex flex-col border rounded-lg divide-y"}>
      <div className={"relative"}>
        <div className={"flex h-[240px] w-[240px] rounded-t-lg overflow-hidden"}>
          <div
            className={cn("absolute inset-0 w-full h-full flex flex-col justify-center items-center text-gray-700 text-xs z-10", (isVideoLoaded) && "opacity-0")}>
            <ScrambleText text={"Generating"} loop></ScrambleText>
            <ScrambleText text={"Avatar"} loop></ScrambleText>
          </div>

          {videoUrl && !isLoading && (
            <video
              ref={videoRef}
              width={240}
              height={240}
              autoPlay
              muted
              playsInline
              loop
              onLoadedData={() => setIsVideoLoaded(true)}
              className={cn("opacity-0", isVideoLoaded && "opacity-100")}
              onEnded={() => setIsPlaying(false)}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          )}
        </div>
      </div>
      <div className={"flex flex-row divide-x rounded-0"}>
        <div className={"flex flex-grow"}>
          <Button variant={"ghost"} className={"flex-grow"} size={"sm"} disabled={!isVideoLoaded} onClick={toggleVideo}>
            {!isPlaying ? (
              <PlayIcon className={"text-black"} radius={10} />
            ) : (
              <PauseIcon className={"text-black"} radius={10} />
            )}
          </Button>
        </div>
        <div className={"flex flex-grow"}>
          <Button variant={"ghost"} className={"flex-grow"} size={"sm"} disabled={!isVideoLoaded} onClick={toggleMuted}>
            {!isMuted ? (
              <Volume2Icon className={"text-black"} radius={10} />
            ) : (
              <VolumeOffIcon className={"text-black"} radius={10} />
            )}
          </Button>
        </div>
        <div className={"flex flex-grow"}>
          <Button variant={"ghost"} className={"flex-grow"} size={"sm"} disabled={!isVideoLoaded}>
            <DownloadIcon className={"text-black"} radius={10} />
          </Button>
        </div>

      </div>
    </div>
  );
}