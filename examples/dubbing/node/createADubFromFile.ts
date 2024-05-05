import * as fs from 'fs';
import { ElevenLabsClient } from 'elevenlabs';
import * as dotenv from 'dotenv';

dotenv.config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
if (!ELEVENLABS_API_KEY) {
  throw new Error("ELEVENLABS_API_KEY environment variable not found. Please set the API key in your environment variables.");
}

const elevenLabs = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });

export async function createDubFromFile(
  inputFilePath: string,
  outputFilePath: string,
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
  const completion = await waitForDubbingCompletion(dubbingId, targetLanguage);

  if (completion) {
    const dubbedContent = await elevenLabs.dubbing.getDubbedFile(dubbingId, targetLanguage);
    fs.writeFileSync(outputFilePath, dubbedContent);
    console.log(`Dubbing complete and saved to ${outputFilePath}.`);
    return outputFilePath;
  } else {
    return null;
  }
}

async function waitForDubbingCompletion(dubbingId: string, languageCode: string): Promise<boolean> {
  const MAX_ATTEMPTS = 120;
  const CHECK_INTERVAL = 10000; // In milliseconds

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const metadata = await elevenLabs.dubbing.getDubbingProjectMetadata(dubbingId);
    if (metadata.status === 'dubbed') {
      return true;
    } else if (metadata.status === 'dubbing') {
      console.log(`Dubbing in progress... Will check status again in ${CHECK_INTERVAL / 1000} seconds.`);
      await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    } else {
      console.error('Dubbing failed:', metadata.error_message);
      return false;
    }
  }
  console.error('Dubbing timed out');
  return false;
}