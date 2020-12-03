import Phaser from 'phaser';
import HomeScene from './scenes/HomeScene';
import BootScene from './scenes/BootScene';
import PreloaderScene from './scenes/PreloaderScene';
import GameOverScene from './scenes/GameOverScene';
import MainScene from './scenes/MainScene';
import { v1 as uuidv1 } from 'uuid';

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

const generateRoomCode = (length) => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

class Client extends Phaser.Game {
  constructor() {
    super(config);
    // configure websocket
    
    const url = window.location.href;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    this.roomcode = urlParams.get('roomcode') || generateRoomCode(4).toUpperCase();
    const devUrl = `wss://4gn89c8vy8.execute-api.us-east-1.amazonaws.com/dev?roomcode=${this.roomcode}`
    
    this.ws = new WebSocket(`${devUrl}`);
    console.log("🚀 ~ file: Client.js ~ line 42 ~ Client ~ constructor ~ this.ws", this.ws)


    this.ws.onopen = () => {
      var connectMsg = { action: "sendmessage", data: "CONNECTION OPENED" };
      this.ws.send(JSON.stringify(connectMsg));
    }
    this.ws.onclose = () => {
      var disconnectMsg = { action: "sendmessage", data: "DISCONNECT" };
      this.ws.send(JSON.stringify(disconnectMsg));
    }
    // this.ws.onopen = event => new SocketMessage(event);
    // this.ws.onerror = event => new SocketError(event);
    // this.ws.onmessage = event => new SocketMessage(event);
    this.ws.onclose = event => {
      // const msg = JSON.stringify({action: 'sendmessage', roomcode: this.roomcode})
      // this.ws.send(msg)
    }
    
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
