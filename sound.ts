import { Howl } from "howler";
export default class Sound {
  static setCategory() {}
  constructor(assets: string[], onError) {
    this.sound = new Howl({
      src: assets,
      onloaderror: onError,
    });
    this.play = this.play.bind(this);
    this.stop = this.stop.bind(this);
  }
  play() {
    if (this.sound.state() !== "loaded") return this;
    this.sound.play();
    return this;
  }

  stop() {
    this.sound.stop();
    return this;
  }
}
