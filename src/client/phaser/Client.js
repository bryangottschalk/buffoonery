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
  console.log('setting player count:', numPlayersConnected);
  const parent = document.getElementById('num-players');
  if (parent.childElementCount > 0) {
    document.getElementById('test').innerHTML = numPlayersConnected;
  } else {
    const el = document.createElement('div');
    el.id = 'test';
    el.innerHTML = numPlayersConnected;
    parent.appendChild(el);
  }
};

const addMessage = (comment) => {
  const parent = document.getElementById('events');
  const el = document.createElement('li');
  el.innerHTML = `${comment.name}: ${comment.chatMsg}`;
  parent.appendChild(el);
};

const setInitialChat = (comments) => {
  const parent = document.getElementById('events');
  comments.forEach((c) => {
    const el = document.createElement('li');
    el.innerHTML = `${c.name}: ${c.chatMsg}`;
    parent.appendChild(el);
  });
};

class Client extends Phaser.Game {
  constructor() {
    super(config);
    // configure websocket
    const url = window.location.href;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    this.roomcode =
      urlParams.get('roomcode') || generateRoomCode(4).toUpperCase();
    const devUrl = `wss://da6wisihu2.execute-api.us-east-1.amazonaws.com/dev?roomcode=${
      this.roomcode
    }&isHost=${true}&name=${'Host'}`;

    this.ws = new WebSocket(`${devUrl}`);
    window.history.pushState('', 'Buffoonery', `?roomcode=${this.roomcode}`);

    this.ws.onopen = async () => {
      this.state = {
        comments: [],
        connectedClients: [],
        roomcode: ''
      };
      // var connectMsg = {
      //   action: 'sendmessage',
      //   data: {
      //     msg: `CONNECTION OPENED IN ROOMCODE: ${this.roomcode}`,
      //     roomcode: this.roomcode
      //   }
      // };
      // this.ws.send(JSON.stringify(connectMsg));

      // get initial room state
      try {
        const { data } = await axios.get(
          `https://dev-api.buffoonery.io/getmeetingstate/${this.roomcode}`
        );
        console.log('INITIAL MEETING STATE', data);
        this.state = data;
        if (data) {
          setPlayersInLobby(this.state.connectedClients.length);
          setInitialChat(data.comments);
        }
      } catch (err) {
        console.error('error getting intial meeting state:', err);
      }
    };
    this.ws.onclose = () => {
      // var disconnectMsg = { action: 'sendmessage', data: 'DISCONNECT' };
      // this.ws.send(JSON.stringify(disconnectMsg));
    };
    // this.ws.onopen = event => new SocketMessage(event);
    // this.ws.onerror = event => new SocketError(event);
    this.ws.onmessage = async (event) => {
      let msg = JSON.parse(event.data);
      if (typeof msg === 'string') {
        msg = JSON.parse(msg);
      }
      const doesContainClientId = (clientIdToCheck) =>
        this.state.connectedClients.some((clientObj) => {
          return clientObj.connectionId === clientIdToCheck;
        });
      console.log('RECEIVED MESSAGE FROM SERVER:', msg);
      console.log('topic', msg.topic);
      if (msg && msg.topic) {
        console.log('topic:', msg.topic);
        switch (msg.topic) {
          case 'Client Connected':
            if (msg.name === 'Host') {
              setTimeout(() => {
                if (!doesContainClientId(msg.client.connectionId)) {
                  this.state.connectedClients.push(msg.client);
                  setPlayersInLobby(this.state.connectedClients.length);
                }
              }, 1000);
            } else {
              if (!doesContainClientId(msg.client.connectionId)) {
                this.state.connectedClients.push(msg.client);
                setPlayersInLobby(this.state.connectedClients.length);
              }
            }

            break;
          case 'Client Disconnected':
            if (doesContainClientId(msg.connectionId)) {
              this.state.connectedClients = this.state.connectedClients.filter(
                (c) => c.connectionId !== msg.connectionId
              );
              setPlayersInLobby(this.state.connectedClients.length);
            }
            break;
          case 'Comment Received':
            console.log('add to chat messages...');
            addMessage(msg.comment);
            break;
          default:
            throw new Error(`Unhandled topic from server: ${msg.topic}`);
        }
      }
      console.log('GAME STATE', this.state);
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
