import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }
  preload() {
    // this.load.image('forest', 'assets/images/forest-background.png');
  }
  create() {
    this.scene.start('Preloader');
  }
}
