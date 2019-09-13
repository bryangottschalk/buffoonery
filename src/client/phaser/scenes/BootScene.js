import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }
  preload() {
    // not current using this but can add a loading spinner later
  }
  create() {
    this.scene.start('Preloader');
  }
}
