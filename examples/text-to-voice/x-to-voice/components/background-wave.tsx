"use client";
import { motion } from "framer-motion";

export const BackgroundWave = () => {
  return (
    <motion.video
      src="/wave-loop.mp4"
      autoPlay
      muted
      loop
      controls={false}
      className="fixed grayscale object-cover bottom-0 z-[-1] hidden md:block pointer-events-none opacity-75 "
    />
  );
};
