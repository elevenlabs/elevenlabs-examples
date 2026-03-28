import "dotenv/config";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const DEFAULT_PROMPT = "A chill lo-fi beat with jazzy piano chords";
const OUTPUT_FILE = "output.mp3";

async function main() {
  const prompt = process.argv.slice(2).join(" ").trim() || DEFAULT_PROMPT;
  const client = new ElevenLabsClient();

  try {
    const track = await client.music.compose({
      prompt,
      musicLengthMs: 10_000,
    });

    const outputPath = path.resolve(process.cwd(), OUTPUT_FILE);
    await pipeline(
      Readable.from(track),
      createWriteStream(outputPath),
    );

    console.log(`Wrote generated music to ${outputPath}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Music generation failed: ${message}`);
    process.exitCode = 1;
  }
}

void main();
