import Phaser from 'phaser';
import HomeScene from './scenes/HomeScene';
import BootScene from './scenes/BootScene';
import PreloaderScene from './scenes/PreloaderScene';
import GameOverScene from './scenes/GameOverScene';
import MainScene from './scenes/MainScene';

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'content',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
};

class Client extends Phaser.Game {
  constructor() {
    super(config);
    // configure websocket
    this.ws = new WebSocket("wss://camoniwkva.execute-api.us-east-1.amazonaws.com/dev");
    this.ws.onopen = () => this.ws.send(JSON.stringify({action: 'sendmessage', data: 'first test message'}))
    // configure scenes
    this.scene.add('Home', HomeScene);
    this.scene.add('Boot', BootScene);
    this.scene.add('Preloader', PreloaderScene);
    this.scene.add('GameOver', GameOverScene);
    this.scene.add('Main', MainScene);
    this.scene.start('Boot');
    // 1) starts boot scene
    // 2) boot scene starts preloader
    // 3) preloader starts game
  }
}

export default Client;
