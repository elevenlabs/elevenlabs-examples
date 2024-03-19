'use client';

export interface ElevenStreamingPlugin {
  initStream(): Promise<void>;
  stop(): Promise<void>;
  flushBuffer(): Promise<void>;
  playChunk(opts: { buffer: string }): Promise<void>;
}

export class ElevenStreamingWeb implements ElevenStreamingPlugin {
  // private audio: HTMLAudioElement = new Audio();
  // private media: MediaSource = new MediaSource();
  // private sourceBuffer?: SourceBuffer;
  private readonly audioContext = new AudioContext();
  private nextPlayTime = 0;
  private scheduledAudioChunks: AudioBufferSourceNode[] = []; //hold source nodes for stopping audio

  async initStream(): Promise<void> {
    // console.log('init called');
    // this.audio = new Audio();
    this.nextPlayTime = 0;
  }

  async stop(): Promise<void> {
    // return this.audio.pause();
    this.scheduledAudioChunks.forEach((source) => {
      try {
        source.stop();
      } catch (e) {
        console.log(e);
      }
    });

    this.scheduledAudioChunks = [];
    this.nextPlayTime = 0;
  }

  async playChunk(opts: { buffer: string }): Promise<void> {
    const binaryData = atob(opts.buffer);

    // Create an ArrayBuffer to hold the binary data.
    const arrayBuffer = new ArrayBuffer(binaryData.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < binaryData.length; i++) {
      uint8Array[i] = binaryData.charCodeAt(i);
    }
    const data = new DataView(arrayBuffer);

    // Create an AudioBufferSourceNode.
    const source = this.audioContext.createBufferSource();
    this.scheduledAudioChunks.push(source);

    // Create an AudioBuffer with the PCM data.
    const audioBuffer = this.audioContext.createBuffer(
      1,
      uint8Array.length / 2,
      44100,
    );
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < data.byteLength; i += 2) {
      const sample = data.getInt16(i, true);
      channelData[i / 2] = sample / 32768;
    }

    // Set the AudioBuffer as the source's buffer.
    source.buffer = audioBuffer;

    // Connect the source to the AudioContext's destination (speakers).
    source.connect(this.audioContext.destination);

    // Start playing the audio immediately.
    if (this.nextPlayTime < this.audioContext.currentTime) {
      this.nextPlayTime = this.audioContext.currentTime;
    }
    source.start(this.nextPlayTime);
    this.nextPlayTime += audioBuffer.duration;
  }

  async flushBuffer(): Promise<void> {
    return;
  }
}

// async play(): Promise<void> {
//   console.log('audio started playing');
//   this.audio
//     .play()
//     .then(() => {
//       console.log('audio started');
//     })
//     .catch(e => {
//       console.log('audio error: ', e);
//     });
// }

// async echo(options: { value: string }): Promise<{ value: string }> {
//   console.log('ECHO', options);
//   return options;
// }

// private base64ToArrayBuffer(base64: string) {
//   const binaryString = window.atob(base64);
//   const length = binaryString.length;
//   const buffer = new ArrayBuffer(length);
//   const view = new Uint8Array(buffer);
//   for (let i = 0; i < length; i++) {
//     view[i] = binaryString.charCodeAt(i);
//   }
//   return view;
// }

// async flushBuffer(): Promise<void> {
//   console.log('buffer is being created');
//   return new Promise(resolve => {
//     this.media = new MediaSource();
//     this.audio.src = window.URL.createObjectURL(this.media);
//     this.media.addEventListener('sourceopen', () => {
//       this.sourceBuffer = this.media.addSourceBuffer('audio/mpeg');
//       console.log('source buffer added successfully');
//       resolve();
//       // Get video segments and append them to sourceBuffer.
//     });
//   });
// }

// async playChunk(opts: { buffer: string }): Promise < void> {
//   console.log('buffer started adding');
//   const buffer = this.base64ToArrayBuffer(opts.buffer);
//   return await new Promise((resolve: any) => {
//     if (!this.sourceBuffer?.updating) {
//       this.sourceBuffer?.appendBuffer(buffer);
//       console.log('buffer added successfully');
//       if (this.audio.paused) this.play();
//       resolve();
//     } else {
//       this.sourceBuffer.onupdateend = () => {
//         this.sourceBuffer?.appendBuffer(buffer);
//         console.log('buffer added successfully');
//         if (this.sourceBuffer) this.sourceBuffer.onupdateend = null;
//         if (this.audio.paused) this.play();
//         resolve();
//       };
//     }
//   });
// }
