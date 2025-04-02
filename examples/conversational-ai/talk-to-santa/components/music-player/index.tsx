"use client";

import { useEffect, useRef, useState } from "react";

const TRACKS = [
  {
    title: "Winter Solstice",
    artist: "Daniel Lau",
    url: "/assets/xi-1.mp3",
  },
  {
    title: "Merry Christmas",
    artist: "Danic Dora",
    url: "/assets/xi-2.mp3",
  },
];

export function MusicPlayer() {
  //const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(TRACKS[currentTrackIndex].url);

    return () => {
      audioRef.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackIndex]);



  return (
    <>
      {/* <div className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-white/20 text-white w-80 hidden sm:block"> */}
        <div className="flex items-center space-x-2">
          {/* Spinning Record */}
          {/* <Vinyl isPlaying={isPlaying} togglePlay={togglePlay} /> */}

          {/* Track Info and Controls */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center justify-between space-x-2">
              {/* <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm truncate">
                  {TRACKS[currentTrackIndex].title}
                </h3>
                <p className="text-xs text-white/70 truncate">
                  {TRACKS[currentTrackIndex].artist}
                </p>
              </div> */}

              {/* Controls */}
              {/* <Button
                size="icon"
                onClick={nextTrack}
                className="bg-black/70 hover:bg-black/60 flex-shrink-0"
              >
                <SkipForward size={20} />
              </Button> */}
            </div>
          </div>
        {/* </div> */}

        {/* Volume Slider */}
        {/* <div className="mt-3">
          <Slider
            value={volume}
            onValueChange={handleVolumeChange}
            max={0.7}
            step={0.01}
            className="w-full"
          />
        </div> */}
      </div>
      {/* Mobile media */}
      {/* <div className="fixed bottom-4 right-4 sm:hidden">
        <div className="flex items-center space-x-2">
          <Vinyl isPlaying={isPlaying} togglePlay={togglePlayMobile} />
        </div>
      </div> */}
    </>
  );
}
