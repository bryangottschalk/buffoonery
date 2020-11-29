import Phaser from 'phaser';

export default class PreloaderScene extends Phaser.Scene {
  constructor() {
    super('Main');
  }
  preload() {

  }
  create() {
    console.log('main scene started',this.sound)
    this.music = this.sound.add('game-music');
    const musicConfig = {
        mute: false,
        volume: 0.3,
        detune: 0,
        seek: 0,
        loop: true,
        delay: 0,
      };
    this.music.play(musicConfig);
    this.background = this.add.image(
        this.game.config.width / 2 - 200,
        this.game.config.height / 2,
        'theater-background'
      );
      this.background.displayWidth = this.game.config.width - 300;
      this.background.scaleY = this.background.scaleX;
  }
}
