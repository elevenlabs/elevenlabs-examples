import "dotenv/config";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { writeFile } from "fs/promises";

const text = process.argv.slice(2).join(" ") || "Hello! Welcome to ElevenLabs text-to-speech.";
const outputPath = "output.mp3";

const client = new ElevenLabsClient();

try {
  const audio = await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
    text,
    modelId: "eleven_multilingual_v2",
  });

  // Collect all chunks into a buffer
  const chunks: Buffer[] = [];
  for await (const chunk of audio) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  await writeFile(outputPath, buffer);
  console.log(`✓ Audio generated successfully: ${outputPath}`);
} catch (error) {
  console.error("Error generating speech:", error instanceof Error ? error.message : error);
  process.exit(1);
}
