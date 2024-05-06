import { ElevenLabsClient } from 'elevenlabs';
import * as dotenv from 'dotenv';
import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { Readable } from 'stream';

dotenv.config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
if (!ELEVENLABS_API_KEY) {
  throw new Error("ELEVENLABS_API_KEY environment variable not found. Please set the API key in your environment variables.");
}

const elevenLabs = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });

export async function downloadDubbedFile(dubbingId: string, languageCode: string): Promise<string> {
    const dirPath = `data/${dubbingId}`;
    if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
    }

    const outputFilePath = `${dirPath}/${languageCode}.mp4`;
    
    return new Promise((resolve, reject) => {
        const writer = createWriteStream(outputFilePath);
        const stream = elevenLabs.dubbing.getDubbedFile(dubbingId, languageCode);

        stream.pipe(writer);
        
        writer.on('finish', () => resolve(outputFilePath));
        writer.on('error', reject);
        stream.on('error', (error) => {
            writer.close();
            reject(error);
        });
    });
}

export async function waitForDubbingCompletion(dubbingId: string): Promise<boolean> {
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