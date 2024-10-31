"use server";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { VoicePreviews } from "@/components/voice-previews";
import { CopyShareLink, ShareOnXButton } from "@/components/share-button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { AvatarPlayer } from "@/components/avatar-player";
import { HumanSpecimen } from "@/app/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function SpecimenCard({ humanSpecimen }: { humanSpecimen: HumanSpecimen }) {

  const human = {
    // facts
    userName: humanSpecimen.user?.userName ?? "Something went wrong",
    origin: humanSpecimen.user?.location ?? "Earth",
    createdAt: humanSpecimen.timestamp,
    profilePicture:
      humanSpecimen.user?.profilePicture.replace(/_normal(?=\.\w+$)/, "") ??
      "",
    // openai-gen
    characteristics: humanSpecimen.analysis.characteristics ?? [],
    humorousDescription: humanSpecimen.analysis.humorousDescription ?? "",
    textToVoicePrompt: humanSpecimen.analysis.textToVoicePrompt ?? "",
    age: humanSpecimen.analysis.age ?? "",
    voiceFerocity: humanSpecimen.analysis.voiceFerocity ?? 50,
    voiceSarcasm: humanSpecimen.analysis.voiceSarcasm ?? 50,
    voiceSassFactor: humanSpecimen.analysis.voiceSassFactor ?? 50,
    // elevenlabs-gen
    voicePreviews: humanSpecimen.voicePreviews ?? [], //this is an array of URLS for example https://c3gi8hkknvghgbjw.public.blob.vercel-storage.com/audio/7xADYsXepoZV1s1Nb1zw-Wz44iHLJfqk9FlSVvHJIsw8PL2QrxI.mp3
  };

  const videoJobId = humanSpecimen.videoJobs?.[0];

  return (
    <div className="w-full max-w-[850px] mx-auto space-y-6">
      <Card className="bg-white/80 sm:backdrop-blur-[16px] sm:shadow-2xl border-none border-0 shadow-none">
        <CardContent className="flex flex-col justify-center items-center p-8">
          <h1 className="mb-4 md:text-3xl text-2xl font-mono text-gray-900 inline sm:hidden">
            <Link
              href={`https://x.com/${human.userName}`}
              rel="noopener noreferrer"
              target={"_blank"}
            >
              @{human.userName}
            </Link>
          </h1>
          <div className="flex justify-between items-start w-full py-4">
            <div className="flex sm:gap-16 md:gap-28 w-full">
              {videoJobId && (
                <div className={"flex flex-grow my-auto justify-center sm:justify-end"}>
                  <AvatarPlayer jobId={videoJobId} />
                </div>
              )}
              <div className={"sm:flex flex-col flex-grow justify-center items-start hidden"}>
                <div>
                  <h1 className="md:text-3xl text-2xl font-mono text-gray-900 mb-2">
                    <Link
                      href={`https://x.com/${human.userName}`}
                      rel="noopener noreferrer"
                      target={"_blank"}
                    >
                      @{human.userName}
                    </Link>
                  </h1>
                  <div className="flex gap-2 items-center justify-center">
                    <ShareOnXButton />
                    <CopyShareLink />
                  </div>
                </div>

              </div>
            </div>
          </div>
          <div className="flex gap-2 items-center justify-center sm:hidden">
            <ShareOnXButton />
            <CopyShareLink />
          </div>
          <Separator className="my-6" />
          <div className="mt-4 w-full">
            <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
              What is this?
            </h2>
            <blockquote className="border-l-2 pl-3 text-sm text-gray-700 leading-relaxed italic">
              This fully open-source project shows what can be built with the new <Link
              href={"https://elevenlabs.io/docs/api-reference/ttv-create-previews"} className={"font-semibold"}
              target={"_blank"}>ElevenLabs Voice Design API</Link>. We use the data from the X/Twitter profile to
              create a prompt for what the voice might sound like. We then create the voice using the <Link
              href={"https://elevenlabs.io/docs/api-reference/ttv-create-previews"} className={"underline"}
              target={"_blank"}>ElevenLabs Voice Design API</Link> and the video using the <Link
              href={"https://www.hedra.com/"} className={"underline"} target={"_blank"}>Hedra video API</Link>.
            </blockquote>
          </div>
          <div className="mt-4">
            <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
              Voice Description
            </h2>
            <blockquote className="border-l-2 pl-3 text-sm text-gray-700 leading-relaxed italic">
              {human.textToVoicePrompt}
            </blockquote>
          </div>
          <div className="my-8 w-full">
            <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
              Voice samples
            </h2>
            <VoicePreviews voicePreviews={human.voicePreviews} />
          </div>
          <div className="flex justify-between items-center mb-8 w-full">
            <div>
              <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                Date Analyzed
              </h2>
              <p className="text-sm text-gray-700">{new Date(human.createdAt).toLocaleString()}</p>
            </div>
            <QRCodeSVG value={`https://x.com/${human.userName}`} className={"h-10 w-10 sm:h-20 sm:w-20"} />
          </div>
          <Link href="/" className={"w-full sm:w-auto"}>
            <Button className="flex">
              <PlusIcon className="w-4 h-4" />
              New voice avatar
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
