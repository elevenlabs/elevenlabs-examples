import { ElevenLabsClient } from 'elevenlabs';
import { createWriteStream } from 'fs';

const elevenlabs = new ElevenLabsClient();

export const createAudioFileFromText = (text: string, fileName: string) => {
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
