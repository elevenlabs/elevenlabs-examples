export class AudioContextPlayer {
  private readonly audioContext = new AudioContext();
  private nextPlayTime = 0;
  private scheduledAudioChunks: AudioBufferSourceNode[] = [];

  async initStream(): Promise<void> {
    this.nextPlayTime = 0;
  }

  async stop(): Promise<void> {
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

    const arrayBuffer = new ArrayBuffer(binaryData.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < binaryData.length; i++) {
      uint8Array[i] = binaryData.charCodeAt(i);
    }
    const data = new DataView(arrayBuffer);

    const source = this.audioContext.createBufferSource();
    this.scheduledAudioChunks.push(source);

    const audioBuffer = this.audioContext.createBuffer(
      1,
      uint8Array.length / 2,
      44100
    );
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < data.byteLength; i += 2) {
      const sample = data.getInt16(i, true);
      channelData[i / 2] = sample / 32768;
    }

    source.buffer = audioBuffer;

    source.connect(this.audioContext.destination);

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
