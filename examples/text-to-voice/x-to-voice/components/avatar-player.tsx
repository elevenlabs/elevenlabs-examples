"use client";

import { useEffect, useRef, useState } from "react";
import { DownloadIcon, PauseIcon, PlayIcon } from "lucide-react";
import { ScrambleText } from "@/components/voice-generator-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AvatarPlayer({ jobId }: {
  jobId: string,
}) {
  const videoRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false); // Track if the video is playing

  const toggleVideo = () => {
    if (!videoRef.current) {
      return;
    }
    if (!isPlaying) {
      videoRef.current.play().then(() => setIsPlaying(true)) // Set state to playing if playback is successful
        .catch(error => console.error("Error playing video:", error));
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  };

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/character/${jobId}`);
        if (!response.ok) throw new Error("Failed to fetch data");
        const result = await response.json();
        setData(result);
        setIsLoading(false);
        clearInterval(intervalId);
      } catch (error) {
        console.error("Error pinging server:", error);
      }
    }, 1000);
    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, [jobId]);

  return (
    <div className={"flex flex-col border rounded-lg divide-y"}>
      <div className={"relative"}>
        <div className={"flex h-[120px] w-[120px] rounded-t-lg overflow-hidden group cursor-pointer"}>
          <div
            className={cn("absolute inset-0 w-full h-full flex flex-col justify-center items-center text-gray-700 text-xs z-10", (isVideoLoaded) && "opacity-0")}>
            <ScrambleText text={"Generating"} loop></ScrambleText>
            <ScrambleText text={"Avatar"} loop></ScrambleText>
          </div>

          {data?.videoUrl && !isLoading && (
            <video
              ref={videoRef}
              width={120}
              height={120}
              playsInline
              onLoadedData={() => setIsVideoLoaded(true)}
              className={cn("opacity-0", isVideoLoaded && "opacity-100")}
              onEnded={() => setIsPlaying(false)}
            >
              <source src={data.videoUrl} type="video/mp4" />
            </video>
          )}
        </div>
      </div>
      <div className={"flex flex-row divide-x rounded-0"}>
        <div className={"flex flex-grow"}>
          <Button variant={"ghost"} className={"flex-grow"} size={"sm"} disabled={!isVideoLoaded} onClick={toggleVideo}>
            { !isPlaying ? (
              <PlayIcon className={"text-black"} radius={10} />
            ): (
              <PauseIcon className={"text-black"} radius={10} />
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