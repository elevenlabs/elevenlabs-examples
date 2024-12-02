"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Phone } from "lucide-react";
import { useEffect, useState } from "react";
import Snowfall from "react-snowfall";
import { cn } from "@/lib/utils";
import { Orb } from "@/components/orb";
import { useConversation } from "@11labs/react";

export default function Home() {
  const [callState, setCallState] = useState<"idle" | "calling" | "connected">(
    "idle"
  );

  const [name, setName] = useState("");

  const [audio] = useState(() => {
    if (typeof Audio !== "undefined") {
      const audioInstance = new Audio("/assets/ringing-phone.mp3");
      audioInstance.loop = true;
      return audioInstance;
    }
    return null;
  });
  const conversation = useConversation();
  
  useEffect(() => {
    const getMedia = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };
    getMedia();
  }, []);

  const handleCallClick = () => {
    if (callState === "idle") {
      setCallState("calling");
      // audio?.play();
      setTimeout(() => {
        setCallState("connected");
        // audio?.pause();
        conversation.startSession({ 
          agentId: "s2aAy02SejH4YNv7Cp4k",
          clientTools: {
            triggerName: async (parameters: { name: string }) => {
              setName(parameters.name);
            },
          }
        });
      }, 0); // TODO: 6000
    }
  };

  return (
    <div className="relative grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div
        className="absolute inset-0 z-[-2]"
        style={{
          background: `radial-gradient(circle, rgb(168 0 0 / 50%) 20%, rgba(0,0,0,0.7) 100%), url('/assets/background.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "color-burn",
        }}
      />

      <h1>Welcome to Talk to Santa {name}</h1>

      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <motion.button
          className={cn(
            "relative flex items-center justify-center text-white rounded-full shadow-lg",
            callState === "connected" ? "w-72 h-72" : "w-64 h-16",
            callState === "idle" ? "bg-red-700" : "bg-red-500"
          )}
          onClick={handleCallClick}
          animate={callState}
          variants={{
            idle: { width: 256, height: 64, borderRadius: 32 },
            calling: { width: 300, height: 64, borderRadius: 32 },
            connected: {
              width: 250,
              height: 250,
              borderRadius: "50%",
              backgroundColor: "rgba(239, 68, 68, 0.2)",
            },
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <AnimatePresence mode="wait">
            {callState === "idle" && (
              <motion.div
                key="idle"
                className="flex items-center space-x-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Phone size={24} />
                <span className="text-lg font-semibold">
                  Call the North Pole
                </span>
              </motion.div>
            )}

            {callState === "calling" && (
              <motion.div
                key="calling"
                className="flex items-center space-x-2"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                <span className="text-lg font-semibold">
                  Checking if Santa is available
                </span>
              </motion.div>
            )}

            {callState === "connected" && (
              <motion.div
                key="connected"
                className="absolute inset-0 flex flex-col items-center justify-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 flex fade-in-animation items-center justify-center">
                    <Orb
                      colors={["#ff0000", "#008000"]}
                      getInputVolume={conversation.getInputVolume}
                      getOutputVolume={conversation.getOutputVolume}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </main>

      <div className="absolute inset-0 z-[-1]">
        <Snowfall
          snowflakeCount={200}
          speed={[0.1, 0.5]}
          opacity={[0.3, 0.8]}
          radius={[0.5, 2.5]}
          wind={[-0.5, 1]}
        />
      </div>
    </div>
  );
}
