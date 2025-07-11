import * as dotenv from "dotenv";
import { ElevenLabsClient, play } from "@elevenlabs/elevenlabs-js";
import { Readable } from "stream";

dotenv.config();
const client = new ElevenLabsClient();

const voices = await client.textToVoice.createPreviews({
  voiceDescription: "An old english wizard with a thick accent",
  text: "Are you ready to be amazed my little muggle friends? The show is about to start and I'm going to show you some wild tricks!",
  // New model params
  loudness: 1, // Controls the volume level of the generated voice. -1 is quietest, 1 is loudest, 0 corresponds to roughly -24 LUFS.
  quality: 0.3, // Higher quality results in better voice output but less variety.
  guidanceScale: 50, // Controls the diversity of the generated voice. Higher values result in more diverse voices.
  seed: 42, // Random number that controls the voice generation. Same seed with same inputs produces same voice.
});
if (voices?.previews.length > 0) {
  // Loop through the voices and play the audio
  for (const voice of voices.previews) {
    const audio = voice.audioBase64;
    if (audio) {
      await play(Readable.from(Buffer.from(audio, "base64")));
    }
  }
}
