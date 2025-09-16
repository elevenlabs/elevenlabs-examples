import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { Storage } from '@google-cloud/storage';

const elevenlabs = new ElevenLabsClient();
const storage = new Storage(/* <enter-your-credentials> */);
const bucket = storage.bucket('<enter-your-bucket-name>');

export const createAudioFromTextToGcp = async (
  text: string,
  remotePath: string,
) => {
  const localPath = 'audio.mp3';

  await createAudioFileFromText(text, localPath);

  await bucket.upload(localPath, {
    destination: remotePath,
    resumable: false,
  });
};

const createAudioFileFromText = async (text: string, output: string) => {
  const audio = await elevenlabs.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
    text,
    modelId: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128',
  });

  const chunks = [];
  for await (const chunk of audio) {
    chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
  }
  const audioBuffer = Buffer.concat(chunks);
  const uint8Array = new Uint8Array(
    audioBuffer.buffer,
    audioBuffer.byteOffset,
    audioBuffer.byteLength,
  );

  await Bun.write(output, uint8Array);
};
