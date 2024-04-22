import "dotenv/config";
import { createAudioFileFromText } from "./text_to_speech_file";
import { createAudioStreamFromText } from "./text_to_speech_stream";
import { generatePresignedUrl, uploadAudioStreamToS3 } from "./s3_uploader";

(async () => {
  const fileName = await createAudioFileFromText(
    "Today, the sky is exceptionally clear, and the sun shines brightly."
  );

  console.log("File name:", fileName);

  const stream = await createAudioStreamFromText(
    "Today, the sky is exceptionally clear, and the sun shines brightly."
  );

  const s3path = await uploadAudioStreamToS3(stream);

  const presignedUrl = await generatePresignedUrl(s3path);

  console.log("Presigned URL:", presignedUrl);
})();
