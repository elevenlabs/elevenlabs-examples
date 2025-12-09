"use client";

import { useState, useRef } from "react";
import { Mic, Circle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  username: string;
}

export default function VoiceRecorder({
  onRecordingComplete,
  username,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        onRecordingComplete(audioBlob);
        setIsComplete(true);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Please allow microphone access to record your voice.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isComplete) {
    return (
      <div className="text-center py-3 sm:py-4">
        <div className="text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-3 flex justify-center">
          <Mic className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-primary" />
        </div>
        <h3 className="text-sm sm:text-base lg:text-lg font-bold mb-1">
          Recording Complete!
        </h3>
        <p className="text-muted-foreground text-xs sm:text-sm px-4">
          Successfully recorded {formatTime(recordingTime)} of audio
        </p>
        <p className="text-green-600 font-medium mt-1 text-xs sm:text-sm flex items-center justify-center gap-1">
          <Check className="w-3 h-3 sm:w-4 sm:h-4" />
          Voice sample ready for cloning
        </p>
      </div>
    );
  }

  return (
    <div className="py-3 sm:py-4">
      {/* Text box - only show when recording */}
      {isRecording && (
        <Card className="mb-4 sm:mb-6 lg:mb-8 max-w-2xl mx-auto bg-white/60 backdrop-blur-[12px] shadow-lg border border-gray-200/40">
          <CardContent className="p-3 sm:p-4 lg:p-6 max-h-[40vh] sm:max-h-[50vh] overflow-y-auto scrollbar-hide">
            <p className="leading-relaxed text-[11px] sm:text-xs lg:text-sm text-gray-700">
              &quot;Hi, I&apos;m @{username}. I&apos;m excited to create my
              voice clone that sounds just like me. This technology is
              fascinating because it captures not just what I say, but how I say
              it. The way I speak, my pace, my tone, my inflection patterns, and
              even the subtle pauses I take between words - all of these unique
              characteristics make up my voice signature. I wonder what
              conversations I&apos;ll have through my voice clone. Will it feel
              like talking to myself? Or will it be like hearing a digital
              version of me for the first time? Either way, this is an
              interesting experiment in understanding how AI can replicate human
              speech patterns and create engaging conversations that feel
              natural and authentic. The quality of this recording will directly
              impact how realistic my AI twin sounds, so I want to speak clearly
              and naturally, expressing my personality through my voice. Voice
              cloning technology has come so far in recent years. It&apos;s
              amazing how artificial intelligence can now analyze the unique
              acoustic properties of someone&apos;s voice and recreate it with
              remarkable accuracy. When I think about it, our voices are
              incredibly complex instruments. They carry not just the words we
              speak, but our emotions, our cultural background, our personality,
              and even hints about our current mood or state of mind. Every
              person has a distinctive vocal fingerprint that&apos;s as unique
              as their physical appearance. The process of voice cloning
              involves sophisticated algorithms that study the frequency
              patterns, resonance, and rhythmic characteristics of my speech.
              These AI systems can identify the subtle nuances that make my
              voice uniquely mine - perhaps the way I emphasize certain
              syllables, or how my voice rises and falls during different types
              of sentences. It&apos;s like creating a digital DNA of my vocal
              cords, tongue placement, and breathing patterns. I&apos;m curious
              about the applications this technology might have. Beyond just
              creating conversational AI agents, voice cloning could help
              preserve voices for future generations, assist people who have
              lost their ability to speak, or even help content creators produce
              audio in multiple languages while maintaining their unique vocal
              identity. The possibilities seem endless, and I&apos;m excited to
              be part of this technological advancement. As I record this
              sample, I&apos;m trying to include a variety of sentence
              structures, emotional tones, and speaking speeds. I want to give
              the AI system as much information as possible about how I
              naturally communicate.&quot;
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recording status in center */}
      {isRecording && (
        <div className="text-center mb-3 sm:mb-4">
          <div className="text-lg sm:text-xl lg:text-2xl font-mono text-destructive mb-1">
            {formatTime(recordingTime)}
          </div>
          <div className="text-[10px] sm:text-xs lg:text-sm animate-pulse flex items-center justify-center gap-1">
            <Circle className="w-2 h-2 sm:w-3 sm:h-3 fill-destructive text-destructive" />
            Recording in progress...
          </div>
        </div>
      )}

      {/* Bottom section with title/description on left and button on right */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 sm:gap-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-center sm:justify-start">
          <div className="text-center sm:text-left">
            <h2 className="text-sm sm:text-base lg:text-lg font-bold">
              Record Your Voice
            </h2>
            <p className="text-muted-foreground text-[10px] sm:text-xs lg:text-sm">
              {isRecording
                ? "Read the text above naturally"
                : "Click to start recording (2 minutes needed)"}
            </p>
          </div>
        </div>

        <Button
          onClick={isRecording ? stopRecording : startRecording}
          variant={isRecording ? "destructive" : "default"}
          size="lg"
          className="w-full sm:w-auto h-10 sm:h-11 px-4 sm:px-6 text-sm sm:text-base touch-manipulation"
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>
      </div>
    </div>
  );
}
