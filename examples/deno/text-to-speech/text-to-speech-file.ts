import 'https://deno.land/x/dotenv/load.ts';
import { readerFromStreamReader } from 'https://deno.land/std/io/mod.ts';
import { copy } from 'https://deno.land/std/io/copy.ts';
import { ElevenLabsClient } from 'npm:elevenlabs';

const elevenlabs = new ElevenLabsClient({
  apiKey: Deno.env.get('ELEVENLABS_API_KEY'),
});

export const createAudioFileFromText = async (
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
