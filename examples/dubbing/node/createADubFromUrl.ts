import { ElevenLabsClient } from 'elevenlabs';
import * as dotenv from 'dotenv';
import { waitForDubbingCompletion, downloadDubbedFile } from './dubbingUtils';

dotenv.config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
if (!ELEVENLABS_API_KEY) {
  throw new Error("ELEVENLABS_API_KEY environment variable not found. Please set the API key in your environment variables.");
}

const elevenLabs = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });

export async function createDubFromUrl(
  sourceUrl: string,
  sourceLanguage: string,
  targetLanguage: string,
): Promise<string | null> {
  const response = await elevenLabs.dubbing.dubAVideoOrAnAudioFile(
    {
      source_url: sourceUrl,
      target_lang: targetLanguage,
      mode: "automatic",
      source_lang: sourceLanguage,
      num_speakers: 1,
      watermark: true,
    }
  );

  const dubbingId = response.dubbingId;
  const completion = await waitForDubbingCompletion(dubbingId);

  if (completion) {
    const outputFilePath = downloadDubbedFile(dubbingId, targetLanguage)
    return outputFilePath;
  } else {
    return null;
  }
}