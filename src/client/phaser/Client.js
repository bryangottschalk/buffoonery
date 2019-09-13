import Phaser from 'phaser';
import GameScene from './scenes/GameScene';
import BootScene from './scenes/BootScene';
import PreloaderScene from './scenes/PreloaderScene';

const config = {
  type: Phaser.AUTO,
  width: 1080,
  height: 720,
  parent: 'content',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  // scene: [GameScene],
};

class Client extends Phaser.Game {
  constructor() {
    super(config);
    this.scene.add('Game', GameScene);
    this.scene.add('Boot', BootScene);
    this.scene.add('Preloader', PreloaderScene);
    // game loads our boot scene, that loads preloader, that loads game
    this.scene.start('Boot');
  }
}

export default Client;
