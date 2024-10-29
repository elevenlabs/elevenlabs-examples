"use server";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { VoicePreviews } from "@/components/voice-previews";
import { CopyShareLink, ShareOnXButton } from "@/components/share-button";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { AvatarPlayer } from "@/components/avatar-player";
import { HumanSpecimen } from "@/app/types";
import Image from "next/image";

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

  const videoJobId = humanSpecimen.videoUrls?.[0]

  return (
    <div className="w-full max-w-[850px] mx-auto space-y-6">
      <Card className="bg-white/80 backdrop-blur-[16px] shadow-2xl border-none m-2">
        <CardContent className="flex flex-col justify-center items-center p-8">
          <h1 className="mb-4 md:text-3xl text-2xl font-mono text-gray-900 inline sm:hidden">
            @{human.userName}
          </h1>
          <div className="flex justify-between items-start mb-8 w-full">
            <div className="flex gap-3 w-full">
              {videoJobId ? (
                <div className={"my-auto mx-auto sm:mx-0"}>
                  <AvatarPlayer jobId={videoJobId} />
                </div>
              ) : (
                <Image
                  alt="profile picture"
                  className="rounded-full w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28"
                  src={human.profilePicture}
                  width={240}
                  height={240}
                />
              )}
              <div className={'sm:flex flex-col flex-grow justify-center items-center hidden'}>
                <h1 className="md:text-3xl text-2xl font-mono text-gray-900 mb-2">
                  @{human.userName}
                </h1>

                <div className="flex gap-2 items-center justify-center">
                  <ShareOnXButton
                    shareText={`This is what I would sound like based on my X posts: #${human.userName} #elevenlabs`}
                  />
                  <CopyShareLink />
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2 items-center justify-center sm:hidden">
            <ShareOnXButton
              shareText={`This is what I would sound like based on my X posts: #${human.userName} #elevenlabs`}
            />
            <CopyShareLink />
          </div>
          <Separator className="my-6" />
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
              <p className="text-sm text-gray-700">{human.createdAt}</p>
            </div>
            <QRCodeSVG value={`https://x.com/${human.userName}`} size={80} />
          </div>
          <Link href="/">
            <Button className="w-full" variant={"outline"}>
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Generate a new profile voice
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
