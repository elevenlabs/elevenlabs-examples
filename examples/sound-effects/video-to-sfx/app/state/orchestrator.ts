import { action, autorun, computed, makeObservable, observable } from "mobx";
import { AudioPlayer } from "./player";

export class Orchestrator {
  sfxPlayers: AudioPlayer[] = [];
  activeIndex = -1;
  caption: string;
  playing: boolean;

  constructor({
    caption,
    soundEffects,
  }: {
    caption: string;
    soundEffects: string[];
  }) {
    this.playing = false;
    this.caption = caption;
    this.sfxPlayers = soundEffects.map(data => new AudioPlayer(data));
    makeObservable(this, {
      caption: observable.ref,
      sfxPlayers: observable.shallow,
      activeIndex: observable.ref,
      playing: observable.ref,
      activePlayer: computed,
      play: action,
      stop: action,
    });
    autorun(() => {
      if (this.playing) {
        this.sfxPlayers.forEach((player, index) => {
          if (index === this.activeIndex) {
            player.start();
          } else {
            player.stop();
          }
        });
      } else {
        this.sfxPlayers.forEach(player => {
          player.stop();
        });
      }
    });
  }

  get activePlayer(): AudioPlayer | null {
    return this.sfxPlayers[this.activeIndex] || null;
  }

  play(index: number) {
    this.activeIndex = index;
    this.playing = true;
  }

  stop() {
    this.playing = false;
  }

  getAudioUrl(index: number) {
    const player = this.sfxPlayers[index];
    return player.data;
  }
}
