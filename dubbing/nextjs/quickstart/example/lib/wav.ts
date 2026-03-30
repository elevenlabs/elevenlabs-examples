/** Encode mono 16-bit PCM little-endian WAV. */
export function float32MonoToWavPcm16(
  samples: Float32Array,
  sampleRate: number
): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) {
      view.setUint8(offset + i, s.charCodeAt(i));
    }
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function mixToMono(buffer: AudioBuffer): Float32Array {
  const length = buffer.length;
  const n = buffer.numberOfChannels;
  const out = new Float32Array(length);
  if (n === 1) {
    out.set(buffer.getChannelData(0));
    return out;
  }
  for (let c = 0; c < n; c++) {
    const ch = buffer.getChannelData(c);
    for (let i = 0; i < length; i++) {
      out[i] += ch[i] / n;
    }
  }
  return out;
}

/** Decode recorded media to WAV File (PCM) for APIs that reject webm/opus. */
export async function recordedBlobToWavFile(
  blob: Blob,
  filename = "recording.wav"
): Promise<File> {
  const arrayBuffer = await blob.arrayBuffer();
  const ctx = new AudioContext();
  try {
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
    const mono = mixToMono(audioBuffer);
    const wav = float32MonoToWavPcm16(mono, audioBuffer.sampleRate);
    return new File([wav], filename, { type: "audio/wav" });
  } finally {
    await ctx.close();
  }
}
