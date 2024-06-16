"use client";
import { Mask, masks, shadows } from "@/frostin-ui";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { FileInput } from "@/components/ui/file-input";
import { springs } from "@/frostin-ui/utils/springs";
import { useScramble } from "use-scramble";
import AutosizeTextarea from "react-textarea-autosize";
import { Orchestrator } from "./state/orchestrator";
import { AudioPlayer } from "./state/player";
import { observer } from "mobx-react";
import { cn } from "@/lib/utils";
import { autorun, reaction } from "mobx";

export const HoverOverlay = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute inset-[4px] bg-gradient-to-tr from-[#08B0D5] to-[#AD20D0] rounded-[inherit] opacity-0 -z-10 group-hover:inset-0 group-hover:opacity-[17.5%] transition-all duration-300",
        className
      )}
    ></div>
  );
};
import { convertVideoToSFX } from "@/lib/videoToSFX";

const LoadingIndicator = () => {
  const { ref, replay } = useScramble({
    text: "Analyzing your video...",
    tick: 3,
    onAnimationEnd: () => {
      setTimeout(() => {
        replay();
      }, 1000);
    },
  });

  return <p ref={ref} />;
};

const FunText = ({ text }: { text: string }) => {
  const { ref, replay } = useScramble({
    text: text,
    tick: 3,
    speed: 0.6,
    playOnMount: true,
    onAnimationEnd: () => {
      setTimeout(() => {
        replay();
      }, 1000);
    },
  });

  return <p ref={ref} />;
};

const variants = {
  card: {
    noFile: {
      boxShadow: shadows.soft({
        angle: 0,
        distance: 50,
        intensity: 0.8,
        blurriness: 0.8,
        layers: 1,
      }),
    },
    hasFile: {
      boxShadow: shadows.soft({
        angle: 0,
        distance: 50,
        intensity: 0,
        blurriness: 0.8,
        layers: 1,
      }),
      transition: springs.xxslow(),
    },
  },
  content: {
    noFile: {
      scale: 1.1,
      y: -220,
      x: "-50%",
    },
    hasFile: {
      scale: 1,
      y: -340,
      x: "-50%",
      transition: springs.xxslow(),
    },
  },
  overlay: {
    hasFile: {
      opacity: 1,
      transition: springs.xxslow(),
    },
    noFile: {
      opacity: 0,
    },
  },
  wave: {
    noFile: {
      scale: 1.08,
    },
    hasFile: {
      scale: 1,
      transition: springs.xxxslow(),
    },
  },
  loader: {
    noFile: {
      opacity: 0,
      y: 30,
    },
    hasFile: {
      opacity: 1,
      y: 0,
      transition: springs.xxxslow(),
    },
  },
};

const Home = observer(() => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [orchestrator, setOrchestrator] = useState<Orchestrator | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  );

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFile(null);
        orchestrator?.stop();
        setOrchestrator(null);
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  });

  useEffect(() => {
    return reaction(
      () => ({
        playing: orchestrator?.playing,
        activeIndex: orchestrator?.activeIndex,
      }),
      () => {
        if (videoRef.current && orchestrator) {
          if (orchestrator.playing) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
          } else {
            videoRef.current.pause();
          }
        }
      }
    );
  }, [orchestrator]);

  return (
    <motion.main
      className=""
      initial="noFile"
      animate={previewUrl ? "hasFile" : "noFile"}
    >
      <motion.video
        src="/wave-loop.mp4"
        autoPlay
        muted
        loop
        controls={false}
        className="fixed overlay object-cover pointer-events-none opacity-75"
        variants={variants.wave}
      />
      <motion.div
        variants={variants.overlay}
        className="fixed overlay bg-white/85 backdrop-blur-lg pointer-events-none"
      ></motion.div>
      <motion.div
        className="absolute w-full md:w-[620px] top-[50vh] left-1/2 mx-auto stack items-center gap-6 p-12 px-0 pb-16"
        variants={variants.content}
      >
        <motion.div
          variants={variants.card}
          className="w-full h-[340px] rounded-3xl bg-white/80 backdrop-blur-md"
        >
          {!previewUrl && (
            <FileInput
              className="h-full w-full"
              onChange={async ({ files }) => {
                setFile(files[0]);
                setIsLoading(true);
                try {
                  const sfx = await convertVideoToSFX(
                    URL.createObjectURL(files[0])
                  );

                  setOrchestrator(
                    new Orchestrator({
                      soundEffects: sfx.soundEffects,
                      caption: sfx.caption,
                    })
                  );
                  setIsLoading(false);
                } catch (e) {
                  console.error(e);
                  setIsLoading(false);
                  setFile(null);
                  window.alert(`Error: ${e}`);
                }
              }}
            >
              <img
                src="/logo-squircle.svg"
                className="w-16 h-16 mb-3 mix-blend-luminosity"
              />
              <div className="font-mono text-sm mb-1">
                Video to sound effects.
              </div>
              <div className="font-mono text-sm text-center text-gray-800/60 h-[1rem]">
                <FunText text="Upload a video." />
              </div>
            </FileInput>
          )}
          {previewUrl && (
            <motion.video
              ref={videoRef}
              src={previewUrl}
              className="h-full w-full rounded-[inherit] object-cover"
              controls
              onPlay={() => {
                orchestrator?.play(orchestrator.activeIndex);
              }}
              onPause={() => {
                orchestrator?.stop();
              }}
            />
          )}
        </motion.div>
        {isLoading && (
          <motion.div
            variants={variants.loader}
            className="w-full center font-mono py-4"
          >
            <LoadingIndicator />
          </motion.div>
        )}
        {orchestrator && (
          <>
            <motion.div className="w-full px-8">
              {/* <AutosizeTextarea
                className="w-full px-2 py-1 bg-transparent focus:outline-none"
                value={orchestrator.caption}
                onChange={() => {}}
              /> */}
            </motion.div>
            <motion.div className="stack gap-4 px-6 w-full">
              {orchestrator.sfxPlayers.map((player, index) => (
                <SoundEffect
                  key={index}
                  index={index}
                  onPlay={() => orchestrator.play(index)}
                  onPause={() => orchestrator.stop()}
                  player={player}
                  active={orchestrator.activeIndex === index}
                />
              ))}
            </motion.div>
          </>
        )}
      </motion.div>
    </motion.main>
  );
});

const Waveform = observer(
  ({
    player,
    barBgColor = "bg-gray-800/30",
  }: {
    player: AudioPlayer;
    barBgColor: string;
  }) => {
    if (!player.waveform) return null;

    const lastTime = player.waveform[player.waveform.length - 1].time;

    return (
      <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none fade-in-animation">
        {player.waveform.map((sample, i) => (
          <div
            key={i}
            style={{
              height: sample.value + "%",
              width: 1.5,
              minHeight: 1,
              position: "absolute",
              left: (sample.time / lastTime) * 100 + "%",
            }}
            className={"rounded-full " + barBgColor}
          />
        ))}
      </div>
    );
  }
);

const SoundEffect = observer(
  ({
    index,
    player,
    onPlay,
    onPause,
    active,
  }: {
    index: number;
    player: AudioPlayer;
    onPlay: () => void;
    onPause: () => void;
    active: boolean;
  }) => {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: 1,
          scale: 1,
          transition: { ...springs.xxxslow(), delay: index * 0.1 },
        }}
        className="group relative h-16 rounded-xl w-full focus-visible:ring-gray-800 focus-visible:ring-2 focus-visible:outline-none"
        onClick={() => {
          if (player.playing) {
            onPause?.();
          } else {
            onPlay?.();
          }
        }}
        onKeyDown={e => {
          if (e.key === " ") {
            e.preventDefault();
            if (player.playing) {
              onPause?.();
            } else {
              onPlay?.();
            }
          }
        }}
      >
        <HoverOverlay className={cn(active && "opacity-20 inset-0")} />
        <div className="overlay inset-4">
          <Waveform player={player} barBgColor="bg-gray-900/30" />
          <Mask
            className="overlay"
            image={masks.linear({
              direction: "to-right",
              opacities: [1, 1, 0, 0],
              positions: [0, player.progress - 0.001, player.progress, 1],
            })}
          >
            <Waveform player={player} barBgColor="bg-gray-900/100" />
          </Mask>
        </div>
      </motion.button>
    );
  }
);

export default Home;
