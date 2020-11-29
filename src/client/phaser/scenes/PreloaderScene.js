import Phaser from 'phaser';

export default class PreloaderScene extends Phaser.Scene {
  constructor() {
    super('Preloader');
  }
  preload() {
    // load assets needed for game
    this.load.image('space-cat', 'assets/images/space-cat.jpg');
    this.load.image('theater-background', 'assets/images/theater-background.jpg');

    this.load.image('forest', 'assets/images/forest-background.png');
    this.load.image('space-cat', 'assets/images/space-cat.jpg');
    this.load.audio('startup-music', ['assets/sounds/startup-music.mp3']);
    this.load.audio('game-music', ['assets/sounds/game-music.mp3']);
    this.load.image('btnStart', 'assets/images/buttons/btnStart.png');
  }
  create() {
    // called automatically once preload has finished
    this.scene.start('Home');
  }
}
