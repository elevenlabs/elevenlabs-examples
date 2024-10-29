"use client"

import { useRef, useState } from "react";
import { PlayIcon } from "lucide-react";
import Image from "next/image";

export function AvatarPlayer({ poster, videoUrl }: {
  poster?: string;
  videoUrl?: string,
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

  return (
    <div className={"relative"}>
      <div
        className={"flex rounded-full overflow-hidden group cursor-pointer"}
        style={{ minHeight: "120px", minWidth: "120px" }}
        onClick={toggleVideo}
      >
        {!isPlaying && (
          <button className={"flex absolute inset-0 items-center justify-center"}>
            <PlayIcon className={"text-white white z-20 group-hover:opacity-70 opacity-0"} fill={"white"}
                      radius={10} />
          </button>
        )}
        <video
          ref={videoRef}
          width={120}
          height={120}
          playsInline
          onEnded={() => setIsPlaying(false)}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      </div>
      <Image
        alt="profile picture"
        priority
        className={"absolute inset-0 rounded-full z-10"}
        src={poster}
        width={120}
        height={120}
      />
    </div>
  );
}