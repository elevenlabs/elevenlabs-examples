import * as dotenv from "dotenv";
import { ElevenLabs } from "elevenlabs"; // Assume this is the ElevenLabs TypeScript import
import { downloadDubbedFile, waitForDubbingCompletion } from "./dubbingUtils"; // Assuming corresponding TypeScript functions

dotenv.config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
if (!ELEVENLABS_API_KEY) {
  throw new Error(
    "ELEVENLABS_API_KEY environment variable not found. " +
      "Please set the API key in your environment variables."
  );
}

// Assuming the class is correctly imported and the constructor accepts an object with an API key
const client = new ElevenLabs({ apiKey: ELEVENLABS_API_KEY });

async function createDubFromUrl(
  sourceUrl: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string | null> {
  const response: any = await client.dubbing.dubAVideoOrAnAudioFile({
    // Assuming the return type to be `any`. Please replace with the correct return type.
    source_url: sourceUrl,
    target_lang: targetLanguage,
    mode: "automatic",
    source_lang: sourceLanguage,
    num_speakers: 1,
    watermark: true,
  });

  const dubbingId = response.dubbing_id;
  const dubbingCompleted: boolean = await waitForDubbingCompletion(dubbingId);
  if (dubbingCompleted) {
    const outputFilePath: string = await downloadDubbedFile(
      dubbingId,
      targetLanguage
    );
    return outputFilePath;
  } else {
    return null;
  }
}

(async () => {
  try {
    const sourceUrl: string = "https://www.youtube.com/watch?v=0EqSXDwTq6U"; // Charlie bit my finger
    const sourceLanguage: string = "en";
    const targetLanguage: string = "fr";
    const result: string | null = await createDubFromUrl(
      sourceUrl,
      sourceLanguage,
      targetLanguage
    );

    if (result) {
      console.log("Dubbing was successful! File saved at:", result);
    } else {
      console.log("Dubbing failed or timed out.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
})();
