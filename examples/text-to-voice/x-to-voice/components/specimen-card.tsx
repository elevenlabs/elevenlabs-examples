import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Flame, MapPin, MessageSquareQuote, RotateCw, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { VoicePreviews } from "@/components/voice-previews";
import { CopyShareLink, ShareOnXButton } from "@/components/share-button";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function SpecimenCard({ humanSpecimen }: { humanSpecimen: any }) {
  const human = {
    // facts
    userName: humanSpecimen?.user?.userName ?? "Something went wrong",
    origin: humanSpecimen?.user?.location ?? "Earth",
    createdAt: humanSpecimen?.timestamp,
    profilePicture:
      humanSpecimen?.user?.profilePicture.replace(/_normal(?=\.\w+$)/, "") ??
      "",
    // openai-gen
    characteristics: humanSpecimen?.analysis?.characteristics ?? [],
    humorousDescription: humanSpecimen?.analysis?.humorousDescription ?? "",
    textToVoicePrompt: humanSpecimen?.analysis?.textToVoicePrompt ?? "",
    age: humanSpecimen?.analysis?.age ?? "",
    voiceFerocity: humanSpecimen?.analysis?.voiceFerocity ?? 50,
    voiceSarcasm: humanSpecimen?.analysis?.voiceSarcasm ?? 50,
    voiceSassFactor: humanSpecimen?.analysis?.voiceSassFactor ?? 50,
    // elevenlabs-gen
    voicePreviews: humanSpecimen?.voicePreviews ?? [], //this is an array of URLS for example https://c3gi8hkknvghgbjw.public.blob.vercel-storage.com/audio/7xADYsXepoZV1s1Nb1zw-Wz44iHLJfqk9FlSVvHJIsw8PL2QrxI.mp3
  };

  const metrics = [
    {
      label: "Voice Ferocity",
      value: human.voiceFerocity,
      description:
        "Measures how aggressive or assertive the specimen's voice is, ranging from calm to primal.",
      icon: <Flame className="w-3 h-3 mr-1" />,
    },
    {
      label: "Sarcasm Quotient",
      value: human.voiceSarcasm,
      description:
        "Detects the likelihood of snark or irony within vocal patterns.",
      icon: <MessageSquareQuote className="w-3 h-3 mr-1" />,
    },
    {
      label: "Sass Factor",
      value: human.voiceSassFactor,
      description:
        "Quantifies the specimen's natural flair for delivering sass.",
      icon: <Sparkles className="w-3 h-3 mr-1" />,
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Card className="bg-white/80 backdrop-blur-[16px] shadow-2xl border-none m-2">
        <CardContent className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div className="flex gap-3">
              <Image
                alt="profile picture"
                className="rounded-full w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28"
                src={human.profilePicture}
                width={120}
                height={120}
              />
              <div>
                <p className="text-xs pb-1">ElevenLabs Report</p>
                {/* replace with font-light */}
                <h1 className="md:text-3xl text-sm font-mono text-gray-900 mb-2">
                  @{human.userName}
                </h1>

                <p className="text-sm text-gray-500 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {!human.origin || human?.origin.length <= 1
                    ? "Earth"
                    : human.origin}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <ShareOnXButton
                shareText={`This is what I would sound like based on my X posts: #${human.userName} #elevenlabs`}
              />
              <CopyShareLink />
            </div>
          </div>
          <Separator className="my-6" />
          <div className="mb-8">
            <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
              Description
            </h2>

            <blockquote className="border-l-2 pl-3 text-sm text-gray-700 leading-relaxed italic">
              {human.humorousDescription}
            </blockquote>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
                Characteristics
              </h2>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-center">
                  <span className="mr-2">▲</span>
                  Age Stratum: {human.age}
                </li>
                {human.characteristics.map((char, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2">▲</span>
                    {char}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
                Metrics
              </h2>
              <div className="space-y-6">
                {metrics.map((metric, index) => (
                  <div key={index} className="space-y-1">
                    <Label className="text-xs text-gray-600 flex items-center mb-1 font-bold">
                      {metric.icon} {metric.label}
                    </Label>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black transition-all duration-500"
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 italic">
                      {metric.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
              Voice Description
            </h2>
            <blockquote className="border-l-2 pl-3 text-sm text-gray-700 leading-relaxed italic">
              {human.textToVoicePrompt}
            </blockquote>
          </div>
          <div className="mb-8">
            <VoicePreviews voicePreviews={human.voicePreviews} />
          </div>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                Date Analyzed
              </h2>
              <p className="text-sm text-gray-700">{human.createdAt}</p>
            </div>
            <QRCodeSVG value={`https://x.com/${human.userName}`} size={80} />
          </div>
          <Link href="/">
            <Button className="w-full">
              <RotateCw className="w-4 h-4 mr-2" />
              Generate a new profile voice
            </Button>
          </Link>
          <p className="mt-4 text-xs text-gray-400 text-center">
            Human voice subject to temporal decay. Terms of existence apply.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
