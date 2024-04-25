export class AudioContextPlayer {
  // Declare class properties: an AudioContext instance, a timer, and an array to keep track of audio chunks
  private readonly audioContext = new AudioContext();
  private nextPlayTime = 0;
  private scheduledAudioChunks: AudioBufferSourceNode[] = [];

  // Initializes or resets the player, setting the next play time to zero
  async initStream(): Promise<void> {
    this.nextPlayTime = 0;
  }

  // Stops all scheduled audio chunks and clears them from the tracking array, and resets the next play time
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

  // Decodes a string into audio data, schedules it for playback, and manages playback timing
  async playChunk(opts: { buffer: string }): Promise<void> {
    const binaryData = atob(opts.buffer); // Decode a base64 encoded string to binary
    const arrayBuffer = new ArrayBuffer(binaryData.length); // Create an ArrayBuffer
    const uint8Array = new Uint8Array(arrayBuffer); // Create a Uint8Array from the ArrayBuffer

    // Fill the Uint8Array with data from the decoded binary string
    for (let i = 0; i < binaryData.length; i++) {
      uint8Array[i] = binaryData.charCodeAt(i);
    }

    // Prepare an AudioBufferSourceNode and add it to the scheduled audio chunks
    const data = new DataView(arrayBuffer);
    const source = this.audioContext.createBufferSource();
    this.scheduledAudioChunks.push(source);

    // Create an AudioBuffer to hold the decoded audio data
    const sampleRate = 44100; // sample rate in Hz
    const audioBuffer = this.audioContext.createBuffer(
      1, // mono audio
      uint8Array.length / 2, // number of frames (16-bit samples, hence dividing by 2)
      sampleRate
    );
    const channelData = audioBuffer.getChannelData(0);

    // Convert the binary data to audio samples
    for (let i = 0; i < data.byteLength; i += 2) {
      const sample = data.getInt16(i, true); // true for little-endian
      channelData[i / 2] = sample / 32768; // Normalize the 16-bit sample
    }

    // Set the buffer for playback and connect to the destination
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);

    // Manage the playback timing, ensuring smooth scheduling
    if (this.nextPlayTime < this.audioContext.currentTime) {
      this.nextPlayTime = this.audioContext.currentTime;
    }

    // Start the playback at the scheduled time and update the next play time
    source.start(this.nextPlayTime);
    this.nextPlayTime += audioBuffer.duration;
  }
}
