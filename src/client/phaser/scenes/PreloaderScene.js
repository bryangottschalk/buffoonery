import Phaser from 'phaser';

export default class PreloaderScene extends Phaser.Scene {
  constructor() {
    super('Preloader');
  }
  preload() {
    // load assets needed for game
    this.load.image('forest', 'assets/images/forest-background.png');
    this.load.spritesheet('archer', 'assets/images/archer.png', {
      frameWidth: 1000,
      frameHeight: 1000,
    });
    this.load.spritesheet(
      'archerAttack',
      'assets/images/archer-attack-spritesheet.png',
      {
        frameWidth: 1051,
        frameHeight: 1000,
      }
    );
    this.load.spritesheet('wizard', 'assets/images/wizard.png', {
      frameWidth: 1000,
      frameHeight: 1000,
    });
    this.load.spritesheet('fighter', 'assets/images/fighter.png', {
      frameWidth: 1000,
      frameHeight: 1000,
    });
    this.load.image('orb', 'assets/images/orb.png');
    this.load.image('forest', 'assets/images/forest-background.png');
    this.load.audio('pop', ['assets/sounds/pop.wav']);
    this.load.audio('arcade-music', ['assets/sounds/arcade-music.wav']);
  }
  create() {
    const music = this.sound.add('arcade-music');
    const musicConfig = {
      mute: false,
      volume: 0.3,
      rate: 1.05,
      detune: 0,
      seek: 0,
      loop: true,
      delay: 0,
    };
    music.play(musicConfig);
    this.scene.start('Game');
  }
}
