import Phaser from 'phaser';

export default class PreloaderScene extends Phaser.Scene {
  constructor() {
    super('Preloader');
  }
  preload() {
    // load assets needed for game
    this.load.image('space-cat', 'assets/images/space-cat.jpg');
    this.load.image(
      'theater-background',
      'assets/images/theater-background.jpg'
    );

    this.load.audio('pop', ['assets/sounds/pop.wav']);
    this.load.image('forest', 'assets/images/forest-background.png');
    this.load.image('space-cat', 'assets/images/space-cat.jpg');
    this.load.audio('lowen-lobby-music-breakbeat', ['assets/sounds/lowen-lobby-music-breakbeat.mp3']);
    this.load.audio('game-music', ['assets/sounds/game-music.mp3']);
    this.load.image('btnStart', 'assets/images/buttons/btnStart.png');
    this.load.spritesheet('fighter', 'assets/images/fighter.png', {
      frameWidth: 1000,
      frameHeight: 1000
    });
    this.load.spritesheet('wizard', 'assets/images/wizard.png', {
      frameWidth: 1000,
      frameHeight: 1000
    });
    this.load.spritesheet('archer', 'assets/images/archer.png', {
      frameWidth: 1000,
      frameHeight: 1000
    });
    this.load.spritesheet(
      'archer-attack',
      'assets/images/archer-attack-spritesheet.png',
      {
        frameWidth: 2116,
        frameHeight: 1000
      }
    );
  }
  create() {
    // called automatically once preload has finished
    this.scene.start('Home');
  }
}
