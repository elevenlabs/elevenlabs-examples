import { ElevenLabsClient } from 'elevenlabs';
import { Storage } from '@google-cloud/storage';
import { createWriteStream } from 'fs';

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

const createAudioFileFromText = (text: string, fileName: string) => {
  return new Promise<void>(async (resolve, reject) => {
    const audio = await elevenlabs.generate({
      voice: 'Rachel',
      model_id: 'eleven_multilingual_v2',
      text,
    });
    const fileStream = createWriteStream(fileName);

    audio.pipe(fileStream);
    fileStream.on('finish', resolve);
    fileStream.on('error', reject);
  });
};
