import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { ElevenLabs } from "elevenlabs"; // Assuming an ElevenLabs TypeScript SDK exists

// Load environment variables
dotenv.config();

// Retrieve the API key
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
if (!ELEVENLABS_API_KEY) {
  throw new Error(
    "ELEVENLABS_API_KEY environment variable not found. " +
      "Please set the API key in your environment variables."
  );
}

const client = new ElevenLabs({ apiKey: ELEVENLABS_API_KEY });

function downloadDubbedFile(
  dubbingId: string,
  languageCode: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const dirPath = path.join("data", dubbingId);
    fs.mkdirSync(dirPath, { recursive: true });

    const filePath = path.join(dirPath, `${languageCode}.mp4`);
    const fileStream = fs.createWriteStream(filePath);
    const dubbedFileStream = client.dubbing.getDubbedFile(
      dubbingId,
      languageCode
    );
    dubbedFileStream.on("data", (chunk: Buffer) => {
      fileStream.write(chunk);
    });
    dubbedFileStream.on("end", () => {
      fileStream.end();
      resolve(filePath);
    });
    dubbedFileStream.on("error", reject);
  });
}

async function waitForDubbingCompletion(dubbingId: string): Promise<boolean> {
  const MAX_ATTEMPTS = 120;
  const CHECK_INTERVAL = 10000; // In milliseconds

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const metadata = await client.dubbing.getDubbingProjectMetadata(dubbingId);
    if (metadata.status === "dubbed") {
      return true;
    } else if (metadata.status === "dubbing") {
      console.log(
        "Dubbing in progress... Will check status again in",
        CHECK_INTERVAL / 1000,
        "seconds."
      );
      await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    } else {
      console.log("Dubbing failed:", metadata.error_message);
      return false;
    }
  }

  console.log("Dubbing timed out");
  return false;
}
