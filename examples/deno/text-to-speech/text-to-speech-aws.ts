import 'https://deno.land/x/dotenv/load.ts';
import { ElevenLabsClient } from 'npm:elevenlabs';
import { S3Client, PutObjectCommand } from 'npm:@aws-sdk/client-s3';

const elevenlabs = new ElevenLabsClient();
const s3 = new S3Client(/* <enter-your-credentials> */);
const bucketName = '<enter-your-bucket-name>';

export const createAudioFromTextToS3 = async (
  text: string,
  remotePath: string,
) => {
  const audio = await elevenlabs.generate({
    voice: 'Rachel',
    model_id: 'eleven_multilingual_v2',
    text,
  });
  const chunks = [];

  for await (const chunk of audio) {
    chunks.push(chunk);
  }

  const content = new Uint8Array(chunks.flat());

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: remotePath,
      Body: content,
      ContentType: 'audio/mpeg',
    }),
  );
};
