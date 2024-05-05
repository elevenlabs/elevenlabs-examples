import { createDubFromFile } from './createADubFromFile';

async function main() {
  try {
    const result = await createDubFromFile(
      "../example_speech.mp3",  // Input file path
      "dubbed_file.mp4",       // Output file path
      "audio/mpeg",            // File format
      "en",                    // Source language
      "es"                     // Target language
    );
    if (result) {
      console.log("Dubbing was successful! File saved at:", result);
    } else {
      console.log("Dubbing failed or timed out.");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();