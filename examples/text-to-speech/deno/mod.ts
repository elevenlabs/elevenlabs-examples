import { createAudioFileFromText } from "./text-to-speech/text-to-speech-file.ts";
import { createAudioFromTextToS3 } from "./text-to-speech/text-to-speech-aws.ts";

await createAudioFileFromText(
  "Today, the sky is exceptionally clear, and the sun shines brightly.",
  "output.mp3"
);

await createAudioFromTextToS3(
  "Today, the sky is exceptionally clear, and the sun shines brightly.",
  "output.mp3"
);
