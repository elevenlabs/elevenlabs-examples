"use client";

import { useState, useRef } from "react";

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

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        onRecordingComplete(audioBlob);
        setIsComplete(true);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
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
      <div className="text-center py-4">
        <div className="text-4xl mb-3">🎤</div>
        <h3 className="text-lg font-bold text-black mb-1">
          Recording Complete!
        </h3>
        <p className="text-black text-sm">
          Successfully recorded {formatTime(recordingTime)} of audio
        </p>
        <p className="text-green-600 font-medium mt-1 text-sm">
          ✓ Voice sample ready for cloning
        </p>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Text box at top */}
      <div className="bg-gray-50 border rounded-lg p-4 mb-8 text-left max-w-2xl mx-auto">
        <p className="text-black leading-relaxed">
          &quot;Hi, I&apos;m @{username}. I&apos;m excited to create my voice
          clone that sounds just like me. This technology is fascinating because
          it captures not just what I say, but how I say it. The way I speak, my
          pace, my tone - all of these unique characteristics make up my voice.
          I wonder what conversations I&apos;ll have through my voice clone.
          Will it feel like talking to myself? Or will it be like hearing a
          digital version of me for the first time? Either way, this is an
          interesting experiment in understanding how AI can replicate human
          speech patterns and create engaging conversations that feel natural
          and authentic. The quality of this recording will directly impact how
          realistic my AI twin sounds, so I want to speak clearly and
          naturally.&quot;
        </p>
      </div>

      {/* Recording status in center */}
      {isRecording && (
        <div className="text-center mb-4">
          <div className="text-2xl font-mono text-red-600 mb-1">
            {formatTime(recordingTime)}
          </div>
          <div className="text-black text-sm">🔴 Recording in progress...</div>
        </div>
      )}

      {/* Bottom section with title/description on left and button on right */}
      <div className="flex justify-between items-end max-w-2xl mx-auto">
        <div className="flex items-center">
          <div className="text-3xl mr-3">🎤</div>
          <div>
            <h2 className="text-lg font-bold text-black">Record Your Voice</h2>
            <p className="text-gray-600 text-sm">
              Read the text above naturally
            </p>
          </div>
        </div>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-6 py-3 cursor-pointer rounded-lg font-medium transition-colors ${
            isRecording
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
      </div>
    </div>
  );
}
