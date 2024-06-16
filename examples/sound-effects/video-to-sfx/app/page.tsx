"use client";
import { shadows } from "@/frostin-ui";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { FileInput } from "@/components/ui/file-input";
import { springs } from "@/frostin-ui/utils/springs";
import { useScramble } from "use-scramble";

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
      y: -160,
    },
    hasFile: {
      scale: 1,
      y: -240,
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

export default function Home() {
  const [file, setFile] = useState<File | null>(null);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  );

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFile(null);
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  });

  return (
    <motion.main
      initial="noFile"
      animate={previewUrl ? "hasFile" : "noFile"}
      className="min-h-screen stack center"
    >
      <motion.video
        src="/wave-loop.mp4"
        autoPlay
        muted
        loop
        controls={false}
        className="fixed overlay object-cover"
        variants={variants.wave}
      />
      <motion.div
        variants={variants.overlay}
        className="fixed overlay bg-white/80 backdrop-blur-lg"
      ></motion.div>
      <motion.div
        className="fixed w-[600px] top-1/2 stack items-center"
        variants={variants.content}
      >
        <motion.div
          variants={variants.card}
          className="w-[600px] h-[340px] rounded-3xl bg-white/80 backdrop-blur-md"
        >
          {!previewUrl && (
            <FileInput
              className="h-full w-full"
              onChange={({ files }) => setFile(files[0])}
            />
          )}
          {previewUrl && (
            <motion.video
              layoutId="video"
              src={previewUrl}
              className="h-full w-full rounded-[inherit] object-cover"
              controls
            />
          )}
        </motion.div>
        <motion.div
          variants={variants.loader}
          className="w-[600px] h-36 center font-mono"
        >
          <LoadingIndicator />
        </motion.div>
      </motion.div>
    </motion.main>
  );
}
