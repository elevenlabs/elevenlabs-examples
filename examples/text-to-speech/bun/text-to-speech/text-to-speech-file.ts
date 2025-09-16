import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const elevenlabs = new ElevenLabsClient();

export const createAudioFileFromText = async (text: string, output: string) => {
  const audio = await elevenlabs.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
    text,
    modelId: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128',
  });

  const chunks: Uint8Array[] = [];
  for await (const chunk of audio) {
    chunks.push(new Uint8Array(chunk));
  }
  const audioBuffer = Buffer.concat(chunks);
  await Bun.write(output, new Uint8Array(audioBuffer));
};
