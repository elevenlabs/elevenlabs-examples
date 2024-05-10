"use client";
import * as AspectRatio from "@radix-ui/react-aspect-ratio";
import { AnimatePresence, PanInfo, cubicBezier, motion } from "framer-motion";
import cn from "classnames";
import { Howler, Howl } from "howler";
import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowUpRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";
import { config } from "./config";
import { languageMap } from "./languageMap";
import LanguageToggle from "./LanguageToggle/LanguageToggle";
import Link from "next/link";
import { PlayCircle } from "@/components/icons";
import styles from "./Carousel.module.scss";
import Typography from "@/components/Typography";
import { fetchIsUserInEU } from "@/utils/cookiebot";
const Waveform = lazy(() => import("./Waveform/Waveform"));

const SWIPE_THRESHOLD = 50;
const DEFAULT_WAVEFORM_COLORS = ["#C369F8", "#ffffff"];

export default function Carousel() {
  const [cookieConsent, setCookieConsent] = useState(
    Boolean(localStorage.getItem("ph_consentDecision"))
  );
  const [videoIndex, setVideoIndex] = useState(0);
  const [audioTrackIndex, setAudioTrackIndex] = useState(0);
  // Add a negative buffer to support infinite navigation
  const [data, setData] = useState([{ ...config[1], index: -1 }, ...config]);
  const [isPlaying, setIsPlaying] = useState(false);

  const dragEndHandler = useCallback(
    (dragInfo: PanInfo) => {
      const draggedDistance = dragInfo.offset.x;
      if (draggedDistance > SWIPE_THRESHOLD) {
        navigateBackwards();
      } else if (draggedDistance < -SWIPE_THRESHOLD) {
        navigateForwards();
      }
    },
    [navigateBackwards, navigateForwards]
  );

  function navigateForwards() {
    const lastIndex = data[data.length - 1].index;
    if (videoIndex === lastIndex - 2) {
      const array = [...data];
      array.shift();
      array.push({ ...array[1], index: lastIndex + 1 });
      setData(array);
    }
    setVideoIndex(videoIndex + 1);
    resetMedia();
  }

  function navigateBackwards() {
    const firstIndex = data[0].index;
    if (videoIndex === firstIndex + 1) {
      const array = [...data];
      array.pop();
      array.unshift({ ...array[array.length - 2], index: firstIndex - 1 });
      setData(array);
    }
    setVideoIndex(videoIndex - 1);
    resetMedia();
  }

  const playVideo = useCallback((index: number, sample: Howl) => {
    const activeVideo = document.getElementById(
      `video-${index}`
    ) as HTMLVideoElement;
    const playing = activeVideo.play();
    playing.then(() => {
      sample.play();
      setIsPlaying(true);
    });
  }, []);

  function resetMedia() {
    Howler.stop();
    const videos = document.querySelectorAll("video");
    videos.forEach(video => {
      video.pause();
      video.load();
    });
    setAudioTrackIndex(0);
    setIsPlaying(false);
  }

  function toggleAudio(videoIndex: number, audioIndex: number, sample: Howl) {
    setAudioTrackIndex(audioIndex);
    if (!isPlaying) return;
    const activeVideo = document.getElementById(
      `video-${videoIndex}`
    ) as HTMLVideoElement;
    const elapsedTime = activeVideo.currentTime;
    Howler.stop();
    sample.seek(elapsedTime);
    sample.play();
  }

  const currentLanguage = useMemo(() => {
    return data.find(item => item.index === videoIndex)?.audioTracks[
      audioTrackIndex
    ].language;
  }, [audioTrackIndex, videoIndex]);

  useEffect(() => {
    const track1 = data.find(item => item.index === videoIndex)?.audioTracks[0]
      .sample;
    const track2 = data.find(item => item.index === videoIndex)?.audioTracks[1]
      .sample;
    const activeVideo = document.getElementById(
      `video-${videoIndex}`
    ) as HTMLVideoElement;
    track1?.load();
    track2?.load();
    activeVideo.load();
  }, [videoIndex]);

  useEffect(() => {
    if (!fetchIsUserInEU()) setCookieConsent(true);
    window.addEventListener("CookiebotOnDialogDisplay", handleCookieConsent);
    window.addEventListener("CookiebotOnTagsExecuted", handleCookieConsent);
    return () => {
      window.removeEventListener(
        "CookiebotOnDialogDisplay",
        handleCookieConsent
      );
      window.removeEventListener(
        "CookiebotOnTagsExecuted",
        handleCookieConsent
      );
    };
  }, []);

  function handleCookieConsent() {
    setCookieConsent(true);
  }

  return (
    <div className="relative">
      <div className={styles.wave}>
        {cookieConsent && (
          <Suspense fallback={null}>
            <Waveform
              colors={
                !isPlaying
                  ? DEFAULT_WAVEFORM_COLORS
                  : languageMap[currentLanguage || "english"].colors
              }
            />
          </Suspense>
        )}
      </div>

      <div className="content">
        <motion.div
          className={cn(styles.carousel, "max-w-screen-2xl w-full mx-auto")}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.25}
          onDragEnd={(_, dragInfo) => dragEndHandler(dragInfo)}
        >
          {data.map(({ video, image, index, id, audioTracks }) => {
            const isActive = index === videoIndex;
            return (
              <motion.div
                className={styles.videoContainer}
                key={`${id}-${index}`}
                initial={false}
                animate={{
                  x: `calc(${index * 105}% - ${videoIndex * 105}%)`,
                  scale: isActive ? 1 : 0.62,
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
                  if (isActive && isPlaying) {
                    resetMedia();
                  }
                }}
              >
                <AspectRatio.Root ratio={16 / 9}>
                  <motion.video
                    id={`video-${index}`}
                    poster={image}
                    src={video}
                    className={styles.video}
                    initial={false}
                    animate={{ opacity: isActive ? 1 : 0.15 }}
                    transition={{
                      ease: cubicBezier(0.7, 0.05, 0.4, 1),
                      duration: 0.8,
                    }}
                    onEnded={() =>
                      playVideo(index, audioTracks[audioTrackIndex].sample)
                    }
                    muted
                    playsInline
                    preload="none"
                  />
                  <AnimatePresence>
                    {isActive && !isPlaying && (
                      <motion.button
                        className={styles.playButton}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        onClick={() =>
                          playVideo(index, audioTracks[audioTrackIndex].sample)
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
                  <div className={styles.overlay} data-active={isActive} />
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        className={styles.toggle}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <LanguageToggle
                          languages={audioTracks.map(
                            ({ language }) => language
                          )}
                          value={audioTrackIndex}
                          onChange={audioIndex =>
                            toggleAudio(
                              videoIndex,
                              audioIndex,
                              audioTracks[audioIndex].sample
                            )
                          }
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </AspectRatio.Root>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
      <div className="content">
        <div className="flex items-center mt-4 gap-4 max-w-screen-2xl mx-auto">
          <div>
            <button
              className="w-12 h-12 bg-gray-50 rounded-s-full	inline-flex items-center justify-center hover:bg-gray-100 transition-colors duration-300"
              onClick={navigateBackwards}
            >
              <ChevronLeftIcon width={20} />
            </button>
            <button
              className="w-12 h-12 bg-gray-50 rounded-e-full inline-flex items-center justify-center hover:bg-gray-100 transition-colors duration-300"
              onClick={navigateForwards}
            >
              <ChevronRightIcon width={20} />
            </button>
          </div>
          <div>
            <div className="overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.div
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{
                    ease: cubicBezier(0.7, 0.05, 0.4, 1),
                    duration: 0.6,
                  }}
                  style={{ whiteSpace: "nowrap" }}
                  key={videoIndex + "subtitle"}
                >
                  <Link
                    href={
                      data.find(item => item.index === videoIndex)?.href || "#"
                    }
                    target="_blank"
                    className="group"
                  >
                    <Typography
                      variant="body1"
                      color="black"
                      weight="medium"
                      className="flex inter gap-1"
                    >
                      {data.find(item => item.index === videoIndex)?.title}
                      <ArrowUpRightIcon
                        width={16}
                        className="group-hover:rotate-45 transition-transform duration-300"
                      />
                    </Typography>
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    ease: cubicBezier(0.7, 0.05, 0.4, 1),
                    duration: 0.6,
                    delay: 0.15,
                  }}
                  key={videoIndex + "subtitle"}
                  style={{ whiteSpace: "nowrap" }}
                >
                  <Typography
                    variant="body2"
                    color="lightGray"
                    weight="normal"
                    className="inline-block inter"
                  >
                    {data.find(item => item.index === videoIndex)?.metadata}
                  </Typography>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
