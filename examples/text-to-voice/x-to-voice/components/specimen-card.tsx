"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Flame,
  Link2,
  MapPin,
  MessageSquareQuote,
  PauseCircle,
  PlayCircle,
  Share2,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useRef, useState } from "react";

export function SpecimenCard() {
  const [humanData] = useState({
    handle: "Louis",
    bio: `Specimen is likely an interesting character`,
    origin: "London",
    characteristics: ["Adaptable", "Resilient", "Enigmatic", "Volatile"],
    age: "25-30",
    manufactureDate: "1900s",
    voiceFerocity: 70,
    sarcasmQuotient: 55,
    sassFactor: 80,
  });

  const metrics = [
    {
      label: "Voice Ferocity",
      value: humanData.voiceFerocity,
      description:
        "Measures how aggressive or assertive the specimen's voice is, ranging from calm to primal.",
      icon: <Flame className="w-3 h-3 mr-1" />,
    },
    {
      label: "Sarcasm Quotient",
      value: humanData.sarcasmQuotient,
      description:
        "Detects the likelihood of snark or irony within vocal patterns.",
      icon: <MessageSquareQuote className="w-3 h-3 mr-1" />,
    },
    {
      label: "Sass Factor",
      value: humanData.sassFactor,
      description:
        "Quantifies the specimen's natural flair for delivering sass.",
      icon: <Sparkles className="w-3 h-3 mr-1" />,
    },
  ];

  const [isPlaying, setIsPlaying] = useState(Array(3).fill(false));
  const audioRefs = [useRef(null), useRef(null), useRef(null)];

  const handlePlayToggle = index => {
    const newIsPlaying = [...isPlaying];
    newIsPlaying[index] = !newIsPlaying[index];
    setIsPlaying(newIsPlaying);

    // Stop other playing audio
    isPlaying.forEach((playing, i) => {
      if (i !== index && playing && audioRefs[i].current) {
        audioRefs[i].current.pause();
        newIsPlaying[i] = false;
      }
    });

    if (audioRefs[index].current) {
      if (newIsPlaying[index]) {
        audioRefs[index].current.play();
      } else {
        audioRefs[index].current.pause();
      }
    }
  };
  const handleShare = (platform: "x" | "copy") => {
    const url = window.location.href;
    const text = `Check out Specimen #${humanData.handle}'s voice on ElevenLabs`;

    switch (platform) {
      case "x":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            text
          )}&url=${encodeURIComponent(url)}`
        );
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        // Could add a toast notification here
        break;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Card className="shadow-lg bg-[#FEFEF2]">
        <CardContent className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-light text-gray-900 mb-2">
                Specimen #{humanData.handle}
              </h1>
              <p className="text-sm text-gray-500 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {humanData.origin}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleShare("x")}
              >
                <Image
                  src="/x.png"
                  alt="X (formerly Twitter) logo"
                  width={20}
                  height={20}
                  className="w-4 h-4"
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleShare("copy")}
              >
                <Link2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="mb-8">
            <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
              Essence Description
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed italic">
              "{humanData.bio}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
                Characteristics
              </h2>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-center">
                  <span className="mr-2">▲</span>
                  Age Stratum: {humanData.age}
                </li>
                {humanData.characteristics.map((char, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2">▲</span>
                    {char}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
                Specimen Metrics
              </h2>
              <div className="space-y-6">
                {metrics.map((metric, index) => (
                  <div key={index} className="space-y-1">
                    <Label className="text-xs text-gray-500 flex items-center mb-1">
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
              Vocal Essence
            </h2>
            <div className="space-y-2">
              {[1, 2, 3].map((num, index) => (
                <div
                  key={num}
                  className="flex items-center text-sm text-gray-700 border border-gray-200 rounded p-2"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700 p-0 mr-2"
                    onClick={() => handlePlayToggle(index)}
                  >
                    {isPlaying[index] ? (
                      <PauseCircle className="w-4 h-4" />
                    ) : (
                      <PlayCircle className="w-4 h-4" />
                    )}
                  </Button>
                  <span>Harmonic Sample {num}</span>
                  <audio
                    ref={audioRefs[index]}
                    src={`/audio/sample${num}.mp3`}
                    onEnded={() => {
                      const newIsPlaying = [...isPlaying];
                      newIsPlaying[index] = false;
                      setIsPlaying(newIsPlaying);
                    }}
                  />
                  <div className="ml-auto text-xs text-gray-400">00:30</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                Genesis Date
              </h2>
              <p className="text-sm text-gray-700">
                {humanData.manufactureDate}
              </p>
            </div>
            <QRCodeSVG value={`https://x.com/${humanData.handle}`} size={80} />
          </div>

          <Link href="/">
            <Button className="w-full">
              <Share2 className="w-4 h-4 mr-2" />
              Transmit Your Data for Vocal Synthesis
            </Button>
          </Link>

          <p className="mt-4 text-xs text-gray-400 text-center">
            Human specimen subject to temporal decay. Terms of existence apply.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
