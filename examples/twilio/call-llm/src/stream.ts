import EventEmitter from 'events';
import { v4 as uuid } from 'uuid';
import { WebSocket } from 'ws';

export class Stream extends EventEmitter {
  ws: WebSocket;
  expectedAudioIndex: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  audioBuffer: any;
  streamSid: string;

  constructor(websocket: WebSocket) {
    super();
    this.ws = websocket;
    this.expectedAudioIndex = 0;
    this.audioBuffer = {};
    this.streamSid = '';
  }

  setStreamSid(streamSid: string) {
    this.streamSid = streamSid;
  }

  buffer(index: number, audio: string) {
    // Escape hatch for intro message, which doesn't have an index
    if (index === null) {
      this.sendAudio(audio);
    } else if (index === this.expectedAudioIndex) {
      this.sendAudio(audio);
      this.expectedAudioIndex++;

      while (
        Object.prototype.hasOwnProperty.call(
          this.audioBuffer,
          this.expectedAudioIndex,
        )
      ) {
        const bufferedAudio = this.audioBuffer[this.expectedAudioIndex];
        this.sendAudio(bufferedAudio);
        this.expectedAudioIndex++;
      }
    } else {
      this.audioBuffer[index] = audio;
    }
  }

  sendAudio(audio: string) {
    this.ws.send(
      JSON.stringify({
        streamSid: this.streamSid,
        event: 'media',
        media: {
          payload: audio,
        },
      }),
    );

    // When the media completes you will receive a `mark` message with the label
    const markLabel = uuid();

    this.ws.send(
      JSON.stringify({
        streamSid: this.streamSid,
        event: 'mark',
        mark: {
          name: markLabel,
        },
      }),
    );
    this.emit('audiosent', markLabel);
  }
}
