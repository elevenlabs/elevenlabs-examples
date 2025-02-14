import "https://deno.land/x/dotenv/load.ts";
import { Buffer } from "node:buffer";
import { ElevenLabsClient } from "npm:elevenlabs";

const client = new ElevenLabsClient({
  apiKey: Deno.env.get("ELEVENLABS_API_KEY"),
});

export const createAudioFileFromText = async (
  text: string,
  output: string
): Promise<void> => {
  const audio = await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
    model_id: "eleven_multilingual_v2",
    output_format: "mp3_44100_128",
    text,
  });

  // Convert stream to buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of audio) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  const file = await Deno.open(output, {
    write: true,
    create: true,
    truncate: true,
  });

  try {
    await file.write(buffer);
    console.log(`Audio file created: ${output}`);
  } finally {
    file.close();
  }
};
