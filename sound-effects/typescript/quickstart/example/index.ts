import "dotenv/config";
import { ElevenLabsClient, ElevenLabsError } from "@elevenlabs/elevenlabs-js";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const DEFAULT_PROMPT = "Cinematic Braam, Horror";
const OUTPUT_FILE = "output.mp3";

function formatError(err: unknown): string {
  if (err instanceof ElevenLabsError) {
    const status =
      err.statusCode !== undefined ? ` (HTTP ${err.statusCode})` : "";
    return `${err.message}${status}`;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return String(err);
}

async function main(): Promise<void> {
  const text = process.argv.slice(2).join(" ").trim() || DEFAULT_PROMPT;

  const client = new ElevenLabsClient();
  const audio = await client.textToSoundEffects.convert({ text });

  const source = Readable.fromWeb(audio);
  await pipeline(source, createWriteStream(OUTPUT_FILE));

  console.log(`Sound effect saved to ${OUTPUT_FILE}`);
}

main().catch((err: unknown) => {
  console.error(`Error: ${formatError(err)}`);
  process.exit(1);
});
