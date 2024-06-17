import * as Tone from "tone";
import { action, makeObservable, observable } from "mobx";
import { clamp } from "lodash";

type Sample = {
  value: number;
  time: number;
};

function resample(
  channelData: Float32Array,
  sampleRate: number,
  targetSampleRate?: number
): Sample[] {
  if (targetSampleRate && targetSampleRate >= sampleRate) {
    throw new Error(
      "Target sample rate should be less than the original sample rate"
    );
  }

  const factor = targetSampleRate
    ? Math.floor(sampleRate / targetSampleRate)
    : 1;
  const samplesWithTime = [];

  if (factor === 1) {
    // If no downsampling is needed, just copy the data over.
    for (let i = 0; i < channelData.length; i++) {
      samplesWithTime.push({ value: channelData[i], time: i / sampleRate });
    }
  } else {
    // Downsample
    for (let i = 0; i < channelData.length; i += factor) {
      let valueSum = 0;
      const actualCount = Math.min(factor, channelData.length - i);

      for (let j = 0; j < actualCount; j++) {
        valueSum += channelData[i + j];
      }

      const avgValue = valueSum / actualCount;
      samplesWithTime.push({ value: avgValue, time: i / sampleRate });
    }
  }

  return samplesWithTime;
}

function normalize(arr: Sample[], newMax = 1): Sample[] {
  if (arr.length === 0) {
    return []; // Early return for empty array
  }

  let currentMax = 0;
  // First pass: Find max absolute value and convert all values to absolute
  // This avoids a separate map operation just to take absolutes
  const absSamples = arr.map(sample => {
    const absValue = Math.abs(sample.value);
    if (absValue > currentMax) {
      currentMax = absValue;
    }
    return { time: sample.time, value: absValue };
  });

  if (currentMax === 0) {
    // If the max is 0, all samples are 0, so we can return the array as-is
    return absSamples;
  }

  const scaleFactor = newMax / currentMax;
  // Second pass: Normalize
  return absSamples.map(sample => ({
    time: sample.time,
    value: sample.value * scaleFactor,
  }));
}

export class AudioPlayer {
  _player: Tone.Player;
  waveformLoaded: boolean;
  audioLoaded: boolean;
  audio: HTMLAudioElement;
  progress: number = 0;
  playing: boolean;
  data: string;

  constructor(data: string) {
    this.audioLoaded = false;
    this.waveformLoaded = false;
    this.playing = false;
    this.data = data;
    this._player = new Tone.Player(
      data,
      action(() => {
        this.waveformLoaded = true;
      })
    ).toDestination();
    this.audio = new Audio(data);
    this.audio.addEventListener("canplay", () => {
      this.audioLoaded = true;
    });
    makeObservable(this, {
      audioLoaded: observable.ref,
      waveformLoaded: observable.ref,
      progress: observable.ref,
      playing: observable.ref,
    });
    this.audio.addEventListener(
      "timeupdate",
      action(() => {
        this.progress = clamp(
          this.audio.currentTime / this.audio.duration,
          0,
          1
        );
        if (this.progress >= 1) {
          this.stop();
        }
      })
    );
  }

  start() {
    this.audio.currentTime = 0;
    this.audio.play();
    this.playing = true;
  }

  stop() {
    this.audio.pause();
    this.playing = false;
  }

  get waveform() {
    if (!this.waveformLoaded) {
      return null;
    }
    // normalize the array so all magnitudes fall between 0-70
    return normalize(
      // sample the array, grabbing 20 samples per seconds
      resample(
        this._player.buffer.getChannelData(0),
        this._player.buffer.sampleRate,
        40
      ).map(s => ({
        time: s.time,
        value: s.value,
      })),
      80
    );
  }
}
