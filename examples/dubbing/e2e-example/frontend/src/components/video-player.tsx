import {
  getAudioStreamUrl,
  getStreamUrl,
  ProjectData,
} from "@/services/dubbing";
import { Howl } from "howler";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, cubicBezier, motion } from "framer-motion";
import { PlayCircle } from "lucide-react";
import "./video-player.css";
import { LanguageToggle } from "./language-toggle";
import { autoDetect, languages } from "./languages";

interface AudioTracks {
  [key: string]: Howl | null;
}

// let's hope that this event could work
const events = ["click"];

const useLoadAudio = (tracks: { key: string; url: string }[]) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [audio, setAudio] = useState<AudioTracks>(() => {
    const obj: AudioTracks = {};
    tracks.forEach(track => {
      obj[track.key] = null;
    });
    return obj;
  });

  const listener = () => {
    const data: AudioTracks = {};

    tracks.forEach(track => {
      data[track.key] = new Howl({
        src: track.url,
        preload: false,
        format: "mp3",
      });
    });

    setAudio(data);
    setLoaded(true);
  };

  useEffect(() => {
    if (loaded) {
      events.forEach(event => {
        document.removeEventListener(event, listener);
      });
    }
  }, [loaded]);

  useEffect(() => {
    events.forEach(event => {
      document.addEventListener(event, listener);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, listener);
      });
    };
  }, []);

  return audio;
};

export default function VideoPlayer({ data }: { data: ProjectData }) {
  const audio = useLoadAudio([
    { key: "raw", url: getAudioStreamUrl(data.id, "raw") },
    ...data.target_languages.map(target => ({
      key: target,
      url: getAudioStreamUrl(data.id, target),
    })),
  ]);

  const videoElement = useRef<HTMLVideoElement | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<string>("raw");
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
    setSelectedTrack("raw");
    setIsPlaying(false);
  };

  const toggleAudio = useCallback(
    (track: string, sample: Howl | null) => {
      setSelectedTrack(track);

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
    if (videoElement.current === null) return;

    for (const key of Object.keys(audio)) {
      const value = audio[key];

      if (value !== null) {
        value.load();
      }
    }
  }, [audio]);

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
                playVideo(audio[selectedTrack]);
              }}
              muted
              playsInline
            >
              <motion.source
                src={getStreamUrl(data.id, "raw")}
                type="video/mp4"
              />
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
                  onClick={() => playVideo(audio[selectedTrack])}
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
                  selectedTrack={selectedTrack}
                  onChange={val => {
                    toggleAudio(val, audio[val]);
                  }}
                  tracks={[
                    autoDetect,
                    ...data.target_languages.map(
                      target => languages.find(l => l.code === target)!
                    ),
                  ]}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
