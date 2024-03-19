import 'https://deno.land/x/dotenv/load.ts';
import { readerFromStreamReader } from 'https://deno.land/std/io/mod.ts';
import { copy } from 'https://deno.land/std/io/copy.ts';
import { ElevenLabsClient } from 'npm:elevenlabs';
import { Storage } from 'npm:@google-cloud/storage';

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

const createAudioFileFromText = async (
  text: string,
  output: string,
): Promise<void> => {
  const audio = await elevenlabs.generate({
    voice: 'Rachel',
    model_id: 'eleven_multilingual_v2',
    text,
  });
  const reader = readerFromStreamReader(audio.getReader());
  const file = await Deno.open(output, {
    write: true,
    create: true,
    truncate: true,
  });
  await copy(reader, file);
  file.close();
};
