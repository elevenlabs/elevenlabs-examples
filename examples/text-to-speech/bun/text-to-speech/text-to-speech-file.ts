import { ElevenLabsClient } from 'elevenlabs';

const elevenlabs = new ElevenLabsClient();

export const createAudioFileFromText = async (text: string, output: string) => {
  const audio = await elevenlabs.generate({
    voice: 'Rachel',
    model_id: 'eleven_multilingual_v2',
    text,
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
