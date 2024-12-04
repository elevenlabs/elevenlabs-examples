"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
interface CallButtonProps {
  status: "disconnected" | "connecting" | "connected" | "disconnecting";
  startCall: () => void;
  isVideoEnabled: boolean;
  setIsVideoEnabled: (isVideoEnabled: boolean) => void;
}

const RINGING_PHONE_AUDIO_DURATION = 0;

export function CallButton({
  status,
  startCall,
  isVideoEnabled,
  setIsVideoEnabled,
}: CallButtonProps) {
  const [isCalling, setIsCalling] = useState(false);
  const [ringingPhoneAudio] = useState(() => {
    if (typeof Audio !== "undefined") {
      const audioInstance = new Audio("/assets/ringing-phone.mp3");
      audioInstance.loop = true;
      return audioInstance;
    }
    return null;
  });

  const onCallClick = () => {
    setIsCalling(true);
    ringingPhoneAudio?.play();
    setTimeout(() => {
      ringingPhoneAudio?.pause();
      ringingPhoneAudio?.load();
      startCall();
    }, RINGING_PHONE_AUDIO_DURATION);
  };
  return (
    <>
      <Button
        variant="default"
        onClick={onCallClick}
        disabled={isCalling || status !== "disconnected"}
        className={cn(
          "relative w-64 h-16 rounded-full border-red-500 border-2 hover:bg-red-900/90 bg-white/5 backdrop-blur-[16px] shadow-2xl",
          isCalling && "bg-red-900/90"
        )}
      >
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Image
            src="/assets/santa.jpg"
            alt="Santa"
            className="rounded-full"
            width={48}
            height={48}
          />
          <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
        </div>
        {!isCalling && (
          <>
            <span className="text-lg ml-10 font-semibold">Call Santa</span>
          </>
        )}
        {isCalling && (
          <>
            <span className="text-lg ml-10 font-semibold">Ringing...</span>
            <span className="ml-2">
              <Loader2 className="w-4 h-4 animate-spin" />
            </span>
          </>
        )}
      </Button>
      {status === "disconnected" && !isCalling && (
        <>
          <div className="mt-4 flex items-center space-x-2">
            <Switch
              id="video-mode"
              checked={isVideoEnabled}
              onCheckedChange={setIsVideoEnabled}
            />
            <Label htmlFor="video-mode" className="text-white font-bold">
              Record Video
            </Label>
          </div>
        </>
      )}
    </>
  );
}
