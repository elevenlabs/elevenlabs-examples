"use client";

import { synthesizeHumanAction } from "@/app/actions/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAction } from "next-safe-action/hooks";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useScramble } from "use-scramble";
import { toast } from "sonner";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const ScrambleText = ({ text, loop = false }: {
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
  const { execute, status, result } = useAction(synthesizeHumanAction);

  const handleGenerateVoice = async () => {
    try {
      await execute({ handle: handle });
    } catch (err) {
      toast.error(`An unexpected error occurred: ${err}`);
    }
  };

  useEffect(() => {
    if (result.serverError) {
      toast.error(result.serverError);
    }
  }, [result]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Card className="bg-white/80 backdrop-blur-[16px] shadow-2xl border-none">
        <CardHeader>
          <CardTitle className="text-2xl">
            What does your X profile sound like?
          </CardTitle>
          <CardDescription>
            Analyze your X profile to generate a unique voice using
            ElevenLabs&apos; new{" "}
            <a
              href="https://elevenlabs.io/docs/voices/voice-lab/voice-design"
              rel="noopener noreferrer"
              target="_blank"
              className="font-medium text-primary underline underline-offset-4"
            >
              text to voice
            </a>{" "}
            feature
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
                  placeholder="username i.e. johndoe"
                  value={handle}
                  onChange={e => setHandle(e.target.value)}
                  disabled={status === "executing"}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              onClick={handleGenerateVoice}
              disabled={handle.length <= 1 || status === "executing"}
            >
              {status === "executing" ? (
                <ScrambleText text="Analyzing..." loop={true} />
              ) : (
                <ScrambleText text="Analyze" loop={false} />
              )}
            </Button>
            <QuickLinks />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const QuickLinks = () => {
  const celebrities = [
    {
      profilePicture: "/mati.jpg",
      handle: "matistanis",
      name: "Mati Staniszewski",
    },
    {
      profilePicture: "/ammaar.jpg",
      handle: "ammaar",
      name: "Ammaar Reshi",
    },
    {
      profilePicture: "/luke.jpg",
      handle: "LukeHarries_",
      name: "Luke Harries",
    },
    {
      profilePicture: "/jonatan.jpg",
      handle: "jonatanvmartens",
      name: "Jonatan von Martens",
    },
  ];

  return (
    <div className="mt-4">
      <p className="text-sm text-gray-500 mb-2">Try these examples:</p>
      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <div className="flex w-20 space-x-4 pt-2">
          {celebrities.map(celeb => (
            <Link
              key={celeb.handle}
              href={`/${celeb.handle}`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "flex-none min-w-[160px] flex p-3 h-auto",
              )}
              prefetch={true}
            >
              <Image priority width={34} height={34} src={celeb.profilePicture} className={"rounded-full"}
                     alt={`${celeb.name} profile picture`} />
              <div className={"flex flex-col items-start text-xs"}>

                <span className="font-medium">@{celeb.handle}</span>
                <span className="text-gray-500 truncate w-full">
                  {celeb.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
