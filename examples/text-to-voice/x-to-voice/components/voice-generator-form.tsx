"use client";

import { getXDetailsAction } from "@/app/actions/get-x-details-action";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAction } from "next-safe-action/hooks";
import Image from "next/image";
import { useState } from "react";
import { useScramble } from "use-scramble";

const ScrambleText = ({
  text,
  loop = false,
}: {
  text: string;
  loop?: boolean;
}) => {
  const { ref, replay } = useScramble({
    text: text,
    tick: 3,
    speed: 0.6,
    ...(loop && {
      onAnimationEnd: () => {
        setTimeout(() => {
          replay();
        }, 1000);
      },
    }),
  });

  return <span ref={ref} />;
};

export function VoiceGenForm() {
  const [handle, setHandle] = useState("");
  const { execute, status, result } = useAction(getXDetailsAction);

  const handleGenerateVoice = async () => {
    try {
      await execute({ handle: handle });
    } catch (error) {
      console.error("Error fetching X details:", error);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Card className="shadow-lg bg-[#FEFEF2]">
        <CardHeader>
          <CardTitle className="text-2xl">Sonic Persona Analyzer</CardTitle>
          <CardDescription>
            Transmit your X profile for vocal specimen analysis and sonic
            creation by ElevenLabs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <div className="relative">
                <Image
                  src="/x.png"
                  alt="X (formerly Twitter) logo"
                  width={20}
                  height={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-53 w-5"
                />
                <Input
                  id="twitter-handle"
                  placeholder="@username"
                  value={handle}
                  onChange={e => setHandle(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              onClick={handleGenerateVoice}
              disabled={handle.length <= 1 || status === "executing"}
            >
              {status === "executing" ? (
                <ScrambleText text="Analyzing Specimen..." loop={true} />
              ) : (
                <ScrambleText text="Analyze Specimen" loop={false} />
              )}
            </Button>
            <code className="text-xs">
              by submitting this form you agree to our terms
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
