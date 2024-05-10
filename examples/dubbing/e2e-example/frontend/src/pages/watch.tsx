"use client";
import * as AspectRatio from "@radix-ui/react-aspect-ratio";
import { AnimatePresence, PanInfo, cubicBezier, motion } from "framer-motion";
import cn from "classnames";
import { Howler, Howl } from "howler";
import { Suspense, lazy, useEffect, useMemo, useState } from "react";

import LanguageToggle from "./Carousel/LanguageToggle/LanguageToggle";
import styles from "./Carousel.module.scss";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { getAudioUrl, getProject, getStreamUrl } from "@/services/dubbing";
import { getLanguageMap } from "./Carousel/languageMap";
const Waveform = lazy(() => import("./Carousel/Waveform/Waveform"));

function PlayCircle({ size = "1rem", color = "currentColor", ...otherProps }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...otherProps}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0ZM9.38154 7.763C9.27273 7.90834 9.27273 8.16868 9.27273 8.68935V15.3104C9.27273 15.8311 9.27273 16.0915 9.38154 16.2368C9.47636 16.3635 9.62151 16.4427 9.77932 16.454C9.96042 16.4669 10.1794 16.3261 10.6174 16.0446L15.7671 12.734C16.1472 12.4897 16.3372 12.3675 16.4028 12.2122C16.4602 12.0765 16.4602 11.9233 16.4028 11.7876C16.3372 11.6323 16.1472 11.5101 15.7671 11.2658L10.6174 7.95523C10.1794 7.67367 9.96042 7.53289 9.77932 7.54583C9.62151 7.5571 9.47636 7.63634 9.38154 7.763Z"
        fill={color}
      />
    </svg>
  );
}

type AudioTrack = {
  language: string;
  sample: Howl;
};

type Config = {
  id: string;
  video: string;
  audioTracks: AudioTrack[];
  index: number;
};

const DEFAULT_WAVEFORM_COLORS = ["#C369F8", "#ffffff"];

export default function Watch() {
  const [audioTrackIndex, setAudioTrackIndex] = useState(0);
  // Add a negative buffer to support infinite navigation
  const [data, setData] = useState<Config>();
  const [isPlaying, setIsPlaying] = useState(false);

  const params = useParams<{ id: string }>();

  const [shouldRefetch, setShouldRefetch] = useState<boolean>(true);

  const { data: projectData, isError } = useQuery({
    queryKey: ["projects", params.id],
    queryFn: () => getProject(params.id!),
    refetchInterval: shouldRefetch ? 2000 : false, // refetch every 15 seconds
  });

  useEffect(() => {
    if (projectData && projectData.status !== "dubbing") {
      setShouldRefetch(false);
    }
  }, [projectData]);

  useEffect(() => {
    if (projectData && projectData.status === "dubbed") {
      console.log(getAudioUrl(projectData.id, "raw"));
      setData({
        id: "demovideo",
        video: getStreamUrl(projectData.id),
        audioTracks: [
          {
            language: "en",
            sample: new Howl({
              src: [getAudioUrl(projectData.id, "raw")],
              preload: true,
            }),
          },
          ...projectData.target_languages.map(language => ({
            language,
            sample: new Howl({
              src: [getAudioUrl(projectData.id, language)],
              preload: true,
            }),
          })),
        ],
        index: 0,
      });
    }
  }, [projectData]);

  const playVideo = (sample: Howl) => {
    const activeVideo = document.getElementById(`video`) as HTMLVideoElement;
    const playing = activeVideo.play();
    playing.then(() => {
      sample.play();
      setIsPlaying(true);
    });
  };

  function resetMedia() {
    Howler.stop();
    const video = document.getElementById("video") as HTMLVideoElement;
    video.pause();
    video.load();
    setAudioTrackIndex(0);
    setIsPlaying(false);
  }

  function toggleAudio(audioIndex: number, sample: Howl) {
    setAudioTrackIndex(audioIndex);
    if (!isPlaying) return;
    console.log("toggling audio 2");
    const activeVideo = document.getElementById(`video`) as HTMLVideoElement;
    const elapsedTime = activeVideo.currentTime;
    Howler.stop();
    sample.seek(elapsedTime);
    sample.play();
  }

  const currentLanguage = useMemo(() => {
    if (!data) return;
    return data?.audioTracks[audioTrackIndex].language;
  }, [audioTrackIndex, data]);

  useEffect(() => {
    if (!data) return;
    const track1 = data?.audioTracks[0].sample;
    const track2 = data?.audioTracks[1].sample;
    const activeVideo = document.getElementById(`video`) as HTMLVideoElement;
    track1?.load();
    track2?.load();
    activeVideo?.load();
  }, [data]);

  return (
    <div className="relative h-screen flex items-center justify-center">
      <div className={styles.wave}>
        <Suspense fallback={null}>
          <Waveform
            colors={
              !isPlaying
                ? DEFAULT_WAVEFORM_COLORS
                : getLanguageMap(currentLanguage || "en").colors
            }
          />
        </Suspense>
      </div>
      {projectData && projectData.status === "dubbing" && (
        <div className="z-40">
          <p
            className="text-center font-semibold text-2xl"
            style={{ color: "black" }}
          >
            Video still processing. Please wait.
          </p>
        </div>
      )}

      <div className="content">
        {data && (
          <motion.div
            className={cn(
              styles.carousel,
              "max-w-screen-2xl w-full mx-auto flex justify-center"
            )}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
          >
            <motion.div
              className={styles.videoContainer}
              key={`1`}
              initial={false}
              animate={{
                x: `calc(${data.index * 105}% - ${data.index * 105}%)`,
                scale: 1,
              }}
              transition={{
                ease: cubicBezier(0.7, 0.05, 0.3, 1),
                duration: 0.8,
              }}
              style={{
                transformOrigin: "bottom left",
                willChange: "transform",
              }}
              onClick={() => {
                if (isPlaying) {
                  resetMedia();
                }
              }}
            >
              <AspectRatio.Root ratio={16 / 9}>
                <motion.video
                  id={`video`}
                  src={data.video}
                  className={styles.video}
                  initial={false}
                  animate={{ opacity: 1 }}
                  transition={{
                    ease: cubicBezier(0.7, 0.05, 0.4, 1),
                    duration: 0.8,
                  }}
                  onEnded={() =>
                    playVideo(data?.audioTracks[audioTrackIndex].sample)
                  }
                  muted
                  playsInline
                />
                <AnimatePresence>
                  {!isPlaying && (
                    <motion.button
                      className={styles.playButton}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      onClick={() =>
                        playVideo(data.audioTracks[audioTrackIndex].sample)
                      }
                      transition={{
                        ease: cubicBezier(0.7, 0.05, 0.4, 1),
                        duration: 0.5,
                        delay: 0.3,
                      }}
                    >
                      <PlayCircle size={64} className={styles.playCircle} />
                    </motion.button>
                  )}
                </AnimatePresence>
                <div className={styles.overlay} data-active={true} />
                <AnimatePresence>
                  {
                    <motion.div
                      className={styles.toggle}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <LanguageToggle
                        languages={data.audioTracks.map(
                          ({ language }) => language
                        )}
                        value={audioTrackIndex}
                        onChange={audioIndex =>
                          toggleAudio(
                            audioIndex,
                            data.audioTracks[audioIndex].sample
                          )
                        }
                      />
                    </motion.div>
                  }
                </AnimatePresence>
              </AspectRatio.Root>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
