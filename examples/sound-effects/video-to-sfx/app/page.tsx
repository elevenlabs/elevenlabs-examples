"use client";
import { Mask, masks, shadows } from "@/frostin-ui";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { FileInput } from "@/components/ui/file-input";
import { springs } from "@/frostin-ui/utils/springs";
import { useScramble } from "use-scramble";
import { Orchestrator } from "./state/orchestrator";
import { AudioPlayer } from "./state/player";
import { observer } from "mobx-react";
import { cn } from "@/lib/utils";
import { reaction } from "mobx";
import { QueryClient, QueryClientProvider, useMutation } from "@tanstack/react-query";
import { convertVideoToSFX } from "@/lib/videoToSFX";
import { ArrowRight, DownloadIcon, Github, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mergeAndDownload } from "@/lib/mergeAndDownload";
import posthog from "posthog-js";
import { Progress } from "@/components/ui/progress";

const HoverOverlay = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute inset-[4px] bg-gradient-to-tr from-[#08B0D5] to-[#AD20D0] rounded-[inherit] opacity-0 -z-10 group-hover:inset-0 group-hover:opacity-[17.5%] transition-all duration-300",
        className,
      )}
    ></div>
  );
};

const queryClient = new QueryClient();

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
        color: "currentColor",
        layers: 1,
      }),
    },
    hasFile: {
      boxShadow: shadows.soft({
        angle: 0,
        distance: 50,
        intensity: 0,
        blurriness: 0.8,
        color: "currentColor",
        layers: 1,
      }),
      transition: springs.xxslow(),
    },
  },
  content: {
    noFile: {
      scale: 1,
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

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || "", {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "",
    person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
  });
}

const HomeDetails = observer(() => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [orchestrator, setOrchestrator] = useState<Orchestrator | null>(null);
  const canceledRef = useRef(false);
  const [isDownloading, setIsDownloading] = useState([
    false,
    false,
    false,
    false,
  ]);
  const [progress, setProgress] = useState([
    0,
    0,
    0,
    0,
  ]);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFile(null);
        orchestrator?.stop();
        setOrchestrator(null);
        canceledRef.current = true;
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
      },
    );
  }, [orchestrator]);

  const mutations = {
    videoToSfx: useMutation({
      mutationFn: async (file: File) =>
        convertVideoToSFX(URL.createObjectURL(file)),
    }),
  };

  useEffect(() => {
    posthog.capture("$pageview");
  }, []);

  return (
    <motion.main
      className="w-full"
      initial="noFile"
      animate={previewUrl ? "hasFile" : "noFile"}
    >
      <motion.video
        src="/wave-loop.mp4"
        autoPlay
        muted
        loop
        controls={false}
        className="fixed overlay object-cover pointer-events-none opacity-75 hidden md:block"
        variants={variants.wave}
      />
      <motion.div
        variants={variants.overlay}
        className="fixed overlay bg-white/85 backdrop-blur-lg pointer-events-none"
      ></motion.div>
      <div className="absolute md:flex justify-between p-4 hidden w-full text-black">
        <a href="https://elevenlabs.io/docs/api-reference/how-to-use-text-to-sound-effects">
          <div className="font-mono text-sm mb-1 text-gray-900">
            <span className="underline pr-2">
              ElevenLabs Texts to Sounds Effects API
            </span>
            <span className="pr-2">is now live</span>
            <ArrowRight className="inline-block" size={16} />
          </div>
        </a>
        <a
          href="https://github.com/elevenlabs/elevenlabs-examples/tree/main/examples/sound-effects/video-to-sfx"
          className="font-mono text-sm mb-1 text-gray-900"
        >
          <span className="pr-2">This code is open source on GitHub</span>
          <Github className="inline-block" size={16} />
        </a>
      </div>
      <motion.div
        className={cn(
          "flex flex-col md:hidden text-black p-4 gap-4",
          previewUrl && "hidden",
        )}
      >
        <a
          className="font-mono text-sm mb-1 text-gray-900"
          href="https://elevenlabs.io/docs/api-reference/how-to-use-text-to-sound-effects"
        >
          <span className="underline pr-2">Texts to Sounds Effects API</span>
          <span className="pr-2">is now live</span>
        </a>
        <a
          className="font-mono text-sm mb-1 text-gray-900"
          href="https://github.com/elevenlabs/elevenlabs-examples/tree/main/examples/sound-effects/video-to-sfx"
        >
          <span className="pr-2">
            This code is open source{" "}
            <span className="underline">on GitHub</span>
          </span>
        </a>
      </motion.div>
      <motion.div
        className="absolute w-full md:w-[620px] top-[50vh] left-1/2 mx-auto stack items-center gap-6 p-6 pt-0 pb-8 md:p-12 md:px-4 md:pb-16"
        variants={variants.content}
      >
        <motion.div
          variants={variants.card}
          className="w-full aspect-video rounded-3xl bg-white/80 backdrop-blur-[16px] text-transparent md:text-black"
        >
          {!previewUrl && (
            <FileInput
              className="h-full w-full"
              onChange={async ({ files }) => {
                setFile(files[0]);
                canceledRef.current = false;
                // const sfx = await convertVideoToSFX(
                //   URL.createObjectURL(files[0])
                // );
                const sfx = await mutations.videoToSfx.mutateAsync(files[0], {
                  onError: e => {
                    setFile(null);
                    window.alert(`Error: ${e}`);
                  },
                });
                if (!canceledRef.current) {
                  setOrchestrator(
                    new Orchestrator({
                      soundEffects: sfx.soundEffects,
                      caption: sfx.caption,
                    }),
                  );
                }
              }}
            >
              <img
                src="/logo-squircle.svg"
                className="w-16 h-16 mb-3 mix-blend-hard-light"
              />
              <div className="font-mono text-sm mb-1 text-gray-900">
                Video to sound effects
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
              playsInline
              onPlay={() => {
                orchestrator?.play(orchestrator.activeIndex);
              }}
              onPause={() => {
                orchestrator?.stop();
              }}
              muted
            />
          )}
        </motion.div>
        {mutations.videoToSfx.isPending && (
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
            <motion.div className="stack gap-3 px-6 w-full">
              {orchestrator.sfxPlayers.map((player, index) => (
                <div className="flex items-center" key={index}>
                  <SoundEffect
                    key={"sound-effect" + index}
                    index={index}
                    onPlay={() => orchestrator.play(index)}
                    onPause={() => orchestrator.stop()}
                    player={player}
                    active={orchestrator.activeIndex === index}
                    onDownload={async () => {
                      const url = orchestrator.getAudioUrl(index);
                      if (!file || !url) {
                        window.alert("Error downloading");
                        return;
                      }
                      setIsDownloading(prev => {
                        const newState = [...prev];
                        newState[index] = true;
                        return newState;
                      });
                      await mergeAndDownload(file, url, (newProgress: number) => {
                        setProgress(prev => {
                          const newState = [...prev];
                          newState[index] = newProgress;
                          return newState;
                        });
                      });
                      setIsDownloading(prev => {
                        const newState = [...prev];
                        newState[index] = false;
                        return newState;
                      });
                    }}
                    progress={progress[index]}
                    isDownloading={isDownloading[index]}
                  />
                </div>
              ))}
            </motion.div>
          </>
        )}
      </motion.div>
    </motion.main>
  );
});

const Home = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HomeDetails />
    </QueryClientProvider>
  );
};

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
  },
);

const SoundEffect = observer(
  ({
     index,
     player,
     onPlay,
     onPause,
     active,
     onDownload,
     isDownloading,
     progress,
   }: {
    index: number;
    player: AudioPlayer;
    onPlay: () => void;
    onPause: () => void;
    active: boolean;
    onDownload: () => void;
    isDownloading: boolean;
    progress: number
  }) => {
    return (
      <motion.div
        role={"button"}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: 1,
          scale: 1,
          transition: { ...springs.xxxslow(), delay: index * 0.1 },
        }}
        className="flex justify-between group relative h-16 rounded-xl w-full focus-visible:ring-gray-800 focus-visible:ring-2 focus-visible:outline-none"
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
        <div className="relative flex-1 h-full rounded-inherit hstack gap-1">
          <div className="overlay inset-4">
            <Waveform player={player} barBgColor="bg-gray-900/20" />
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
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={e => {
            e.stopPropagation();
            onDownload?.();
          }}
          key={"download" + index}
          className="self-center mr-3 rounded-full bg-transparent hover:bg-white/25 active:bg-white/40 border-gray-800/20"
        >
          {isDownloading ? (
            <span className={'text-[10px] text-gray-900/50'}>{progress}%</span>
          ) : (
            <DownloadIcon size={16} className="text-gray-800/50" />
          )}
        </Button>
      </motion.div>
    );
  }
);

export default Home;
