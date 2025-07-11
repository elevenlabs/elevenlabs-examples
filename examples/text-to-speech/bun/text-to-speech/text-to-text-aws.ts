import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const elevenlabs = new ElevenLabsClient();
const s3 = new S3Client(/* <enter-your-credentials> */);
const bucketName = '<enter-your-bucket-name>';

export const createAudioFromTextToS3 = async (
  text: string,
  remotePath: string,
) => {
  const audio = await elevenlabs.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
    text,
    modelId: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128',
  });

  const chunks = [];

  for await (const chunk of audio) {
    chunks.push(chunk);
  }

  const content = Buffer.concat(chunks);

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: remotePath,
      Body: content,
      ContentType: 'audio/mpeg',
    }),
  );
};
