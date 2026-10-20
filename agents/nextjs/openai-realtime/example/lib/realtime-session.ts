import type { ElevenLabs } from "@elevenlabs/elevenlabs-js";

export const REALTIME_URL = "wss://api.elevenlabs.io/v1/convai/realtime";
export const REALTIME_MODEL = "eleven_realtime_v1_mini";
export const REALTIME_VOICE = "brian";
export const AUDIO_SAMPLE_RATE = 24000;

export const AGENT_INSTRUCTIONS =
  "You are a helpful, friendly voice assistant. Keep your replies concise and conversational.";

export const sessionConfig: ElevenLabs.OpenAiSessionConfigInput = {
  type: "realtime",
  model: REALTIME_MODEL,
  instructions: AGENT_INSTRUCTIONS,
  outputModalities: ["audio"],
  audio: {
    input: {
      format: { type: "audio/pcm", rate: AUDIO_SAMPLE_RATE },
      turnDetection: { type: "semantic_vad", eagerness: "medium" },
    },
    output: {
      format: { type: "audio/pcm" },
      voice: REALTIME_VOICE,
    },
  },
  temperature: 0.7,
};
