import { NextResponse } from 'next/server';
import { ElevenLabsClient } from 'elevenlabs';

const elevenlabs = new ElevenLabsClient();

export const POST = async () => {
  const audio = await elevenlabs.generate({
    voice: 'Rachel',
    text: 'Hello',
    model_id: 'eleven_multilingual_v2',
  });

  console.log(audio);

  return NextResponse.json({});
};
