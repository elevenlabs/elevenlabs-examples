import * as fs from 'fs';
import { ElevenLabsClient } from 'elevenlabs';
import * as dotenv from 'dotenv';
import { waitForDubbingCompletion, downloadDubbedFile } from './dubbingUtils';

dotenv.config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
if (!ELEVENLABS_API_KEY) {
  throw new Error("ELEVENLABS_API_KEY environment variable not found. Please set the API key in your environment variables.");
}

const elevenLabs = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });

export async function createDubFromFile(
  inputFilePath: string,
  fileFormat: string,
  sourceLanguage: string,
  targetLanguage: string,
): Promise<string | null> {
  if (!fs.existsSync(inputFilePath)) {
    throw new Error(`The input file does not exist: ${inputFilePath}`);
  }

  const response = await elevenLabs.dubbing.dubAVideoOrAnAudioFile(
    fs.createReadStream(inputFilePath),
    fileFormat,
    {
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