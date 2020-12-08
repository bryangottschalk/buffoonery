import Phaser from 'phaser';
import HomeScene from './scenes/HomeScene';
import BootScene from './scenes/BootScene';
import PreloaderScene from './scenes/PreloaderScene';
import GameOverScene from './scenes/GameOverScene';
import MainScene from './scenes/MainScene';
import { v1 as uuidv1 } from 'uuid';
import axios from 'axios';

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'content',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};

const generateRoomCode = (length) => {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

const setPlayersInLobby = (numPlayersConnected) => {
  console.log('setting player count:', numPlayersConnected)
  const parent = document.getElementById('num-players');
  if (parent.childElementCount > 0) {
    document.getElementById('test').innerHTML = numPlayersConnected;
  } else {
    const el = document.createElement('div');
    el.id = 'test';
    el.innerHTML = numPlayersConnected;
    parent.appendChild(el);
  }
}

class Client extends Phaser.Game {
  constructor() {
    super(config);
    // configure websocket
    const url = window.location.href;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    this.roomcode =
      urlParams.get('roomcode') || generateRoomCode(4).toUpperCase();
    const devUrl = `wss://da6wisihu2.execute-api.us-east-1.amazonaws.com/dev?roomcode=${this.roomcode}`;

    this.ws = new WebSocket(`${devUrl}`);

    this.ws.onopen = async () => {
      // var connectMsg = {
      //   action: 'sendmessage',
      //   data: {
      //     msg: `CONNECTION OPENED IN ROOMCODE: ${this.roomcode}`,
      //     roomcode: this.roomcode
      //   }
      // };
      // this.ws.send(JSON.stringify(connectMsg));

      // get initial room state
      setTimeout(async () => {
        try {
          const { data } = await axios.get(
            `https://dev-api.buffoonery.io/getmeetingstate/${this.roomcode}`
          );
          console.log('INITIAL MEETING STATE', data);
          this.state = data;
          if (data) {
            setPlayersInLobby(this.state.connectedClients.length)
          }
        } catch (err) {
          console.error('error getting intial meeting state:', err);
        }
      }, 500)
    };
    this.ws.onclose = () => {
      // var disconnectMsg = { action: 'sendmessage', data: 'DISCONNECT' };
      // this.ws.send(JSON.stringify(disconnectMsg));
    };
    // this.ws.onopen = event => new SocketMessage(event);
    // this.ws.onerror = event => new SocketError(event);
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(JSON.parse(event.data))
      console.log('RECEIVED MESSAGE FROM SERVER:', msg);
      if (msg && msg.topic && msg.connectedClients) {
        console.log('topic:', msg.topic)
        switch (msg.topic) {

          case 'Client Connected':
            if (!this.state.connectedClients.includes(msg.connectionId)) {
              this.state.connectedClients.push(msg.connectionId)
              setPlayersInLobby(this.state.connectedClients.length)
            }
            break;
          case 'Client Disconnected':
            if (this.state.connectedClients.includes(msg.connectionId)) {
              this.state.connectedClients = this.state.connectedClients.filter((c) => c !== msg.connectionId)
              setPlayersInLobby(this.state.connectedClients.length)
            }
            break;
          default:
            throw new Error(`Unhandled topic from server: ${msg.topic}`)
        }
      }
      console.log('GAME STATE', this.state)
    };
    this.ws.onclose = (event) => {
      // const msg = JSON.stringify({action: 'sendmessage', roomcode: this.roomcode})
      // this.ws.send(msg)
    };

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
