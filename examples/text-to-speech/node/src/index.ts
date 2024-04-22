import "dotenv/config";
import { createAudioFileFromText } from "./text_to_speech_file";
import { createAudioStreamFromText } from "./text_to_speech_stream";
import { generatePresignedUrl, uploadAudioStreamToS3 } from "./s3_uploader";

(async () => {
  // save the audio file to disk
  const fileName = await createAudioFileFromText(
    "Today, the sky is exceptionally clear, and the sun shines brightly."
  );

  console.log("File name:", fileName);

  // stream the audio, upload to S3, and get a presigned URL
  const stream = await createAudioStreamFromText(
    "Today, the sky is exceptionally clear, and the sun shines brightly."
  );

  const s3path = await uploadAudioStreamToS3(stream);

  const presignedUrl = await generatePresignedUrl(s3path);

  console.log("Presigned URL:", presignedUrl);
})();
