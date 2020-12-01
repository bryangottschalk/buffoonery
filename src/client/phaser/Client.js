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
    const roomcode = urlParams.get('roomcode') | generateRoomCode(4)
  
    this.ws = new WebSocket(`wss://oyvtlf0pch.execute-api.us-east-1.amazonaws.com/dev?roomcode=${roomcode}`);

    this.ws.onopen = () => {
      const roomcode = urlParams.get('roomcode')
      if (!roomcode) {
        console.log('no roomcode from URL, creating gameroom id...')
        //const msg = JSON.stringify({action: 'sendmessage', gameroomId: uuidv1(), roomcode: roomcode, data: 'new gameroom created'})
        //this.ws.send(msg);
      } else {
        console.log('roomcode detected from URL... getting existing room')
      }
    }
    // this.ws.onopen = event => new SocketMessage(event);
    // this.ws.onerror = event => new SocketError(event);
    // this.ws.onmessage = event => new SocketMessage(event);
    // this.ws.onclose = event => new SocketClose(event);
    
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
