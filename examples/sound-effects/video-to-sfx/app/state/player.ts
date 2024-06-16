import * as Tone from "tone";
import { action, makeObservable, observable } from "mobx";

export class AudioPlayer {
  _player: Tone.Player;
  loading: boolean;

  constructor(data: string) {
    this.loading = true;
    this._player = new Tone.Player(
      data,
      action(() => {
        this.loading = false;
      })
    ).toDestination();
    makeObservable(this, {
      loading: observable.ref,
    });
  }

  start(offset: number, duration: number) {
    try {
      this._player.start(Tone.now(), offset, duration);
    } catch (err) {
      console.error(err);
    }
  }

  stop() {
    if (this._player.state === "started") {
      try {
        this._player.stop();
      } catch (err) {
        console.error(err);
      }
    }
  }
}
