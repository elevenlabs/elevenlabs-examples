"use client";
import { shadows } from "@/frostin-ui";
import Image from "next/image";
import { motion } from "framer-motion";

const variants = {
  card: {
    standalone: {
      boxShadow: shadows.soft({
        angle: 0,
        distance: 50,
        intensity: 0.8,
        blurriness: 0.8,
        layers: 1,
      }),
    },
    embedded: {
      boxShadow: shadows.soft({
        angle: 0,
        distance: 50,
        intensity: 0,
        blurriness: 0.8,
        layers: 1,
      }),
    },
  },
};

export default function Home() {
  return (
    <main className="min-h-screen center">
      <video
        src="/wave-loop.mp4"
        autoPlay
        muted
        loop
        controls={false}
        className="fixed overlay object-cover"
      />
      <motion.div
        className="w-[600px] h-[340px] rounded-3xl bg-white/80 backdrop-blur-md"
        variants={variants.card}
        initial="standalone"
        animate="standalone"
        whileHover="embedded"
      />
    </main>
  );
}
