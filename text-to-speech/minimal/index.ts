import "dotenv/config";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";

const text = process.argv.slice(2).join(" ") || "Hello! This is a test of ElevenLabs text to speech.";
const outputPath = "output.mp3";

async function main() {
  const client = new ElevenLabsClient();

  const audio = await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
    text,
    modelId: "eleven_multilingual_v2",
  });

  await pipeline(audio, createWriteStream(outputPath));
  console.log(`Done! Audio saved to ${outputPath}`);
}

main().catch((error) => {
  console.error("Error:", error.message ?? error);
  process.exit(1);
});
