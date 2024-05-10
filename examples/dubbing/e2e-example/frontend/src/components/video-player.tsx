import { getAudioStreamUrl, getStreamUrl } from "@/services/dubbing";
import { Howl } from "howler";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, cubicBezier, motion } from "framer-motion";
import { PlayCircle } from "lucide-react";
import "./video-player.css";
import { LanguageToggle } from "./language-toggle";

// let's hope that this event could work
const events = ["click"];

const useLoadAudio = (
  originalTrackUrl: string,
  alternativeTrackUrl: string
) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [audio, setAudio] = useState<{
    audioRaw: Howl | null;
    audioConverted: Howl | null;
  }>({
    audioConverted: null,
    audioRaw: null,
  });

  const listener = () => {
    setAudio({
      audioRaw: new Howl({
        src: originalTrackUrl,
        preload: false,
        format: "mp3",
      }),
      audioConverted: new Howl({
        src: alternativeTrackUrl,
        preload: false,
        format: "mp3",
      }),
    });
    setLoaded(true);
  };

  useEffect(() => {
    if (loaded) {
      events.forEach((event) => {
        document.removeEventListener(event, listener);
      });
    }
  }, [loaded]);

  useEffect(() => {
    events.forEach((event) => {
      document.addEventListener(event, listener);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, listener);
      });
    };
  }, []);

  return audio;
};

export default function VideoPlayer({
  id,
  sourceLang,
  targetLang,
}: {
  id: string;
  sourceLang: string;
  targetLang: string;
}) {
  const { audioRaw, audioConverted } = useLoadAudio(
    getAudioStreamUrl(id, "raw"),
    getAudioStreamUrl(id, targetLang)
  );

  const videoElement = useRef<HTMLVideoElement | null>(null);
  const [isAlternativeTrack, setIsAlternativeTrack] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const playVideo = (sample: Howl | null) => {
    if (videoElement.current === null || sample === null) {
      return;
    }

    videoElement.current.play().then(() => {
      sample.play();
      setIsPlaying(true);
    });
  };

  const resetMedia = () => {
    Howler.stop();
    console.log("reset");
    if (videoElement.current !== null) {
      videoElement.current.pause();
      videoElement.current.load();
    }
    setIsAlternativeTrack(false);
    setIsPlaying(false);
  };

  const toggleAudio = useCallback(
    (isAlternativeTrack: boolean, sample: Howl | null) => {
      setIsAlternativeTrack(isAlternativeTrack);

      if (!isPlaying || videoElement.current === null || sample === null)
        return;

      const elapsedTime = videoElement.current.currentTime;
      Howler.stop();
      sample.seek(elapsedTime);
      sample.play();
    },
    [isPlaying]
  );

  useEffect(() => {
    if (
      videoElement.current === null ||
      audioRaw === null ||
      audioConverted === null
    )
      return;
    audioRaw.load();
    audioConverted.load();
    // videoElement.current.load(); // this line of cause cause a headache for 1 hour
  }, [audioRaw, audioConverted]);

  useEffect(() => {
    return () => {
      Howler.stop();
    };
  }, []);

  return (
    <div>
      <motion.div className="max-w-screen-md w-full mx-auto relative flex gap-2">
        <motion.div
          onClick={() => {
            if (isPlaying) {
              resetMedia();
            }
          }}
          className="absolute w-full border border-white border-solid rounded-3xl"
        >
          <div className="aspect-video">
            <motion.video
              ref={videoElement}
              className="w-full h-wull object-cover pointer-events-none"
              onEnded={() => {
                playVideo(isAlternativeTrack ? audioConverted : audioRaw);
              }}
              muted
              playsInline
            >
              <motion.source src={getStreamUrl(id, "raw")} type="video/mp4" />
            </motion.video>
            <AnimatePresence>
              {!isPlaying && (
                <motion.button
                  style={{
                    top: "calc(50% - 32px)",
                    left: "calc(50% - 32px)",
                  }}
                  className="absolute flex justify-center items-center text-white"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  onClick={() =>
                    playVideo(isAlternativeTrack ? audioConverted : audioRaw)
                  }
                  transition={{
                    ease: cubicBezier(0.7, 0.05, 0.4, 1),
                    duration: 0.5,
                    delay: 0.3,
                  }}
                >
                  <PlayCircle size={64} className="playCircle" />
                </motion.button>
              )}
            </AnimatePresence>
            <AnimatePresence>
              <motion.div
                className="absolute bottom-4 right-4 translate-x-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <LanguageToggle
                  isAlternativeTrack={isAlternativeTrack}
                  onChange={(val) => {
                    toggleAudio(val, val ? audioConverted : audioRaw);
                  }}
                  sourceLang={sourceLang}
                  targetLang={targetLang}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
