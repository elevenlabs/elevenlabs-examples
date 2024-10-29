"use client";

import { useEffect, useRef, useState } from "react";
import { PlayIcon } from "lucide-react";
import { ScrambleText } from "@/components/voice-generator-form";
import { cn } from "@/lib/utils";

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
    <div className={"relative"}>
      <div
        className={"flex h-[120px] w-[120px] border rounded-full overflow-hidden group cursor-pointer"}
        onClick={toggleVideo}
      >
        <div
          className={cn("absolute inset-0 w-full h-full flex flex-col justify-center items-center text-gray-700 text-xs z-10", (isVideoLoaded) && "opacity-0")}>
          <ScrambleText text={"Generating"} loop></ScrambleText>
          <ScrambleText text={"Avatar"} loop></ScrambleText>
        </div>
        {!isPlaying && !isLoading && data?.videoUrl && isVideoLoaded && (
          <button className={"flex absolute inset-0 items-center justify-center"}>
            <PlayIcon className={"text-white white z-20 fade-in"} fill={"white"} radius={10} />
          </button>
        )}
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
  );
}