import "dotenv/config";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { createReadStream } from "fs";

const inputPath = process.argv[2] || "./audio.mp3";

try {
  const client = new ElevenLabsClient();
  const result = await client.speechToText.convert({
    file: createReadStream(inputPath),
    modelId: "scribe_v2",
  });
  console.log(result.text);
} catch (error) {
  console.error("Transcription failed:", (error as Error).message);
  process.exit(1);
}
