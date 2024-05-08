import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
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

const client = new ElevenLabs({ apiKey: ELEVENLABS_API_KEY });

async function createDubFromFile(
  inputFilePath: string,
  fileFormat: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string | null> {
  if (!fs.existsSync(inputFilePath)) {
    throw new Error(`The input file does not exist: ${inputFilePath}`);
  }

  const fileStream = fs.createReadStream(inputFilePath);
  const response = await client.dubbing.dubAVideoOrAnAudioFile({
    file: {
      value: fileStream,
      options: {
        filename: path.basename(inputFilePath),
        contentType: fileFormat,
      },
    },
    target_lang: targetLanguage,
    mode: "automatic",
    source_lang: sourceLanguage,
    num_speakers: 1,
    watermark: false,
  });

  const dubbingId = response.dubbing_id;
  const dubbingCompleted = await waitForDubbingCompletion(dubbingId);
  if (dubbingCompleted) {
    const outputFilePath = await downloadDubbedFile(dubbingId, targetLanguage);
    return outputFilePath;
  } else {
    return null;
  }
}

// Assuming that this script is being run directly
(async () => {
  try {
    const result = await createDubFromFile(
      "../example_speech.mp3", // Input file path
      "audio/mpeg", // File format
      "en", // Source language
      "es" // Target language
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
