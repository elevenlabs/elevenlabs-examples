import EventEmitter from 'events';
import { Buffer } from 'node:buffer';
import fetch from 'node-fetch';

export class TextToSpeech extends EventEmitter {
  voiceId = '21m00Tcm4TlvDq8ikWAM';
  outputFormat = 'ulaw_8000';
  nextExpectedIndex: number = 0;
  speechBuffer: Record<number, string> = {};

  constructor() {
    super();
  }

  async generate(
    llmReply: {
      partialResponseIndex?: number | null;
      partialResponse: string;
    },
    interactionCount: number,
  ) {
    const { partialResponseIndex, partialResponse } = llmReply;

    if (!partialResponse) {
      return;
    }

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}/stream?output_format=${this.outputFormat}&optimize_streaming_latency=3`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY!,
            'Content-Type': 'application/json',
            accept: 'audio/wav',
          },
          body: JSON.stringify({
            model_id: 'eleven_turbo_v2',
            text: partialResponse,
          }),
        },
      );
      const audioArrayBuffer = await response.arrayBuffer();

      this.emit(
        'speech',
        partialResponseIndex,
        Buffer.from(audioArrayBuffer).toString('base64'),
        partialResponse,
        interactionCount,
      );
    } catch (err) {
      console.error('Error occurred in TextToSpeech service');
      console.error(err);
    }
  }
}
