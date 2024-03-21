import EventEmitter from 'events';
import { Buffer } from 'node:buffer';
import axios from 'axios';

export class TextToSpeech extends EventEmitter {
  voiceId = '21m00Tcm4TlvDq8ikWAM';
  outputFormat = 'ulaw_8000';
  nextExpectedIndex = 0;
  speechBuffer: Record<number, string> = {};

  constructor() {
    super();
  }

  async generate(llmReply: {
    partialResponseIndex?: number | null;
    partialResponse: string;
  }) {
    const { partialResponseIndex, partialResponse } = llmReply;

    if (!partialResponse) {
      return;
    }

    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}/stream?output_format=${this.outputFormat}&optimize_streaming_latency=3`,
        {
          model_id: 'eleven_turbo_v2',
          text: partialResponse,
        },
        {
          responseType: 'arraybuffer', // To handle binary data, such as audio
          headers: {
            'xi-api-key': process.env['ELEVENLABS_API_KEY'],
            accept: 'audio/wav',
          },
        },
      );

      const audioArrayBuffer = response.data;

      this.emit(
        'speech',
        partialResponseIndex,
        Buffer.from(audioArrayBuffer).toString('base64'),
        partialResponse,
      );
    } catch (err) {
      console.error('Error occurred in TextToSpeech service');
      console.error(err);
    }
  }
}
