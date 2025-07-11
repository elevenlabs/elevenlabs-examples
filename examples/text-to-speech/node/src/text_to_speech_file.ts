import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { writeFileSync } from "node:fs";

import { v4 as uuid } from "uuid";

const elevenlabs = new ElevenLabsClient();

export async function createAudioFileFromText(text: string): Promise<string> {
  const audio = await elevenlabs.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
    text,
    modelId: "eleven_multilingual_v2",
    outputFormat: "mp3_44100_128",
  });
  const fileName = `${uuid()}.mp3`;

  // Convert stream to buffer and write synchronously
  const chunks: Buffer[] = [];
  for await (const chunk of audio) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  writeFileSync(fileName, buffer);

  return fileName;
}
