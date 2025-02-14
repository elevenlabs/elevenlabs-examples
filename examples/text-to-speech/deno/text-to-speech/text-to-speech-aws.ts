import "https://deno.land/x/dotenv/load.ts";
import { Buffer } from "node:buffer";
import { ElevenLabsClient } from "npm:elevenlabs";
import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3";

const client = new ElevenLabsClient();
const s3 = new S3Client({
  region: Deno.env.get("AWS_REGION_NAME")!,
  credentials: {
    accessKeyId: Deno.env.get("AWS_ACCESS_KEY_ID")!,
    secretAccessKey: Deno.env.get("AWS_SECRET_ACCESS_KEY")!,
  },
});
const bucketName = Deno.env.get("AWS_S3_BUCKET_NAME")!;

export const createAudioFromTextToS3 = async (
  text: string,
  remotePath: string
) => {
  const audio = await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
    model_id: "eleven_multilingual_v2",
    output_format: "mp3_44100_128",
    text,
  });

  // Convert stream to buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of audio) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: remotePath,
        Body: buffer,
        ContentType: "audio/mpeg",
      })
    );
    console.log(`Audio file uploaded to S3: ${remotePath}`);
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};
