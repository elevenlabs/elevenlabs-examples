"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { LanguageDropdown, LANGUAGES } from "@/components/language-dropdown";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface CallButtonProps {
  status: "disconnected" | "connecting" | "connected" | "disconnecting";
  startCall: () => void;
  hasMediaAccess: boolean;
  requestMediaPermissions: () => void;
  language: string | null;
  setLanguage: (value: string) => void;
  languages: typeof LANGUAGES;
}

const RINGING_PHONE_AUDIO_DURATION = 6000;

export function CallButton({
  status,
  startCall,
  hasMediaAccess,
  requestMediaPermissions,
  language,
  setLanguage,
  languages,
}: CallButtonProps) {
  const [isCalling, setIsCalling] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [ringingPhoneAudio] = useState(() => {
    if (typeof Audio !== "undefined") {
      const audioInstance = new Audio("/assets/ringing-phone.mp3");
      audioInstance.loop = true;
      return audioInstance;
    }
    return null;
  });

  const onCallClick = () => {
    if (!hasMediaAccess) {
      requestMediaPermissions();
      return;
    }
    setShowAgeModal(true);
  };

  const handleAgeConfirm = () => {
    setShowAgeModal(false);
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
      {!isCalling && (
        <div className={"text-white flex items-center gap-2 text-sm mb-2"}>
          For the best experience, find a quiet place
        </div>
      )}
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
            src="/assets/santa.webp"
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

      {!isCalling && (
        <div className={"text-sm"}>
          <span className="text-gray-200">Powered by</span>{" "}
          <Link
            target="_blank"
            href="https://elevenlabs.io/conversational-ai"
            className={cn(
              buttonVariants({ variant: "link" }),
              "text-white pl-0"
            )}
          >
            ElevenLabs Conversational AI
          </Link>
        </div>
      )}

      {!isCalling && (
        <div className={"flex items-center gap-2 text-sm mt-2"}>
          <LanguageDropdown
            language={language}
            setLanguage={setLanguage}
            languages={languages}
          />
        </div>
      )}
      <Dialog open={showAgeModal} onOpenChange={setShowAgeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Before You Continue</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 text-sm text-left">
                <p>By clicking &quot;I Agree&quot; below, you confirm that:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>You are 18 years of age or older.</li>
                  <li>
                    You understand that &quot;Santa&quot; is an AI character powered by
                    ElevenLabs, not a real person.
                  </li>
                  <li>
                    You consent to your conversation being recorded.
                  </li>
                  <li>
                    You understand that your recording may be shared with third
                    parties for the purpose of generating your personalized
                    card.
                  </li>
                </ul>
                <p>
                  For more information, please review our{" "}
                  <Link
                    href="https://elevenlabs.io/privacy-policy"
                    target="_blank"
                    className="underline text-primary"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-y-2 mt-4">
            <Button
              variant="secondary"
              className="bg-red-800 hover:bg-red-600 text-white mb-2 sm:mb-0"
              onClick={() => setShowAgeModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-green-800 hover:bg-green-600"
              onClick={handleAgeConfirm}
            >
              I Agree
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
