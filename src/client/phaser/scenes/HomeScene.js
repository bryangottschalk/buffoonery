import Phaser from 'phaser';
import createBall from '../customFunctions/createBall';
import createBumpers from '../customFunctions/createBumpers';
import getBall from '../customFunctions/getBall';
import getBumpers from '../customFunctions/getBumpers';
import checkWin from '../customFunctions/checkWin';
import { v1 as uuidv1 } from 'uuid';
import axios from 'axios';

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

class HomeScene extends Phaser.Scene {
  constructor() {
    super('Home');
    // TODO: replace with aws socket events
    // this.state = {
    //   score: {
    //     player1: 0,
    //     player2: 0
    //   },
    //   playerOneState: {
    //     direction: null
    //   },
    //   playerTwoState: {
    //     direction: null
    //   },
    //   playerIds: [],
    //   playerCount: 0
    // };
    // this.socket = io('http://localhost:8080');
    // this.socket.on('state', (state) => {
    //   // LISTENING FOR STATE FROM SERVER
    // const parent = document.getElementById('num-players');
    // if (parent.childElementCount > 0) {
    //   document.getElementById('test').innerHTML = state.playerCount;
    // } else {
    //   const el = document.createElement('div');
    //   el.id = 'test';
    //   el.innerHTML = state.playerCount;
    //   parent.appendChild(el);
    // }

    //   this.state = state;
    // });
    // console.log(
    //   '🚀 ~ file: HomeScene.js ~ line 44 ~ HomeScene ~ constructor ~ this.state',
    //   this.state
    // );
    // this.socket.on('p2joined', () => {
    //   // scoring starts when p2 joins
    //   if (this.isFirstPlayer) {
    //     this.waitingForSecondPlayer.setVisible(false);
    //   }
    // });
    // this.socket.on('connection', () => {
    //   console.log('connected');
    // });
    // this.socket.on('disconnect', () => {
    //   console.log('disconnection');
    // });
    // this.socket.on('message', (text) => {
    //   // listens for message from server
    //   const parent = document.getElementById('events');
    //   const el = document.createElement('li');
    //   el.innerHTML = text;
    //   parent.appendChild(el);
    // });
    // this.socket.on('gameOverMessage', (text) => {
    //   const parent = document.getElementById('events');
    //   const el = document.createElement('li');
    //   el.innerHTML = text;
    //   parent.appendChild(el);
    // });
    // this.chatSubmitted = this.chatSubmitted.bind(this);
  }

  preload() {
    this.disableVisibilityChange = true; // does not require focus for game to run
    document
      .querySelector('#chat-form')
      .addEventListener('submit', this.chatSubmitted);
  }

  chatSubmitted(e) {
    e.preventDefault();
    const input = document.querySelector('#chat');
    const text = input.value;
    input.value = '';
    // TODO: this.socket.emit('message', text); // send message to server with payload of string text
  }

  play() {
    this.music.stop();
    this.scene.start('Main');
  }
  create() {
    const game = window.game;
    const scene = this;
    scene.players = [];
    // configure websocket
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    game.roomcode =
      urlParams.get('roomcode') || generateRoomCode(4).toUpperCase();
    const devUrl = `wss://da6wisihu2.execute-api.us-east-1.amazonaws.com/dev?roomcode=${
      game.roomcode
    }&isHost=${true}&name=${'Host'}`;

    game.ws = new WebSocket(`${devUrl}`);
    window.history.pushState('', 'Buffoonery', `?roomcode=${game.roomcode}`);

    game.ws.onopen = async () => {
      game.state = {
        comments: [],
        connectedClients: [],
        roomcode: ''
      };
      // var connectMsg = {
      //   action: 'sendmessage',
      //   data: {
      //     msg: `CONNECTION OPENED IN ROOMCODE: ${game.roomcode}`,
      //     roomcode: game.roomcode
      //   }
      // };
      // game.ws.send(JSON.stringify(connectMsg));

      // get initial room state
      try {
        const { data } = await axios.get(
          `https://dev-api.buffoonery.io/getmeetingstate/${game.roomcode}`
        );
        console.log('INITIAL GAME STATE', data);
        game.state = data;
        if (data) {
          setPlayersInLobby(
            game.state.connectedClients.filter((client) => !client.isHost)
              .length
          );
          setInitialChat(data.comments);
        }
      } catch (err) {
        console.error('error getting intial meeting state:', err);
      }
    };
    game.ws.onclose = () => {};
    game.ws.onerror = (event) => {};
    game.ws.onmessage = async (event) => {
      let msg = JSON.parse(event.data);
      if (typeof msg === 'string') {
        msg = JSON.parse(msg);
      }
      const doesContainClientId = (clientIdToCheck) =>
        game.state.connectedClients.some((clientObj) => {
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
                  game.state.connectedClients.push(msg.client);
                  setPlayersInLobby(
                    game.state.connectedClients.filter(
                      (client) => !client.isHost
                    ).length
                  );
                }
              }, 1000);
            } else {
              if (!doesContainClientId(msg.client.connectionId)) {
                game.state.connectedClients.push(msg.client);
                setPlayersInLobby(
                  game.state.connectedClients.filter((client) => !client.isHost)
                    .length
                );
              }
              if (msg.name !== 'Host') {
                this.game.sound.play('pop');
                const playerNumber = game.state.connectedClients.indexOf(
                  game.state.connectedClients.find(
                    (c) => c.connectionId === msg.client.connectionId
                  )
                );
                const getCharacter = (playerNumber) => {
                  switch (playerNumber) {
                    case 1:
                      return 'fighter';
                    case 2:
                      return 'archer';
                    case 3:
                      return 'wizard';
                    default:
                      return 'fighter';
                  }
                };
                if (playerNumber > 1) {
                  // is not player 1
                  scene[`player${playerNumber}`] = this.physics.add.sprite(
                    scene[`player${playerNumber - 1}`]['x'] + 200, // player info appears 200px to the right of the previous player
                    800,
                    getCharacter(playerNumber)
                  );
                  // set size and name of the current player
                  scene[`player${playerNumber}`].displayWidth = 175;
                  scene[`player${playerNumber}`].displayHeight = 175;
                  scene[`player${playerNumber}`].Name = this.add.text(
                    scene[`player${playerNumber - 1}`]['x'] + 150, // player info appears 200px to the right of the previous player
                    900,
                    `${msg.name}`,
                    {
                      fontSize: '25px'
                    }
                  );
                } else {
                  // is player 1
                  scene.player1 = this.physics.add.sprite(
                    150,
                    800,
                    getCharacter(playerNumber)
                  );
                  scene.player1.displayWidth = 175;
                  scene.player1.displayHeight = 175;
                  scene.player1.Name = this.add.text(100, 900, `${msg.name}`, {
                    fontSize: '25px'
                  });
                }
              }
            }
            console.log('UPDATED GAME STATE', game.state);
            break;
          case 'Client Disconnected':
            if (doesContainClientId(msg.client.connectionId)) {
              game.state.connectedClients = game.state.connectedClients.filter(
                (c) => c.connectionId !== msg.connectionId
              );
              setPlayersInLobby(
                game.state.connectedClients.filter((client) => !client.isHost)
                  .length
              );
            }
            console.log('UPDATED GAME STATE', game.state);
            break;
          case 'Comment Received':
            console.log('add to chat messages...');
            addMessage(msg.comment);
            break;
          default:
            throw new Error(`Unhandled topic from server: ${msg.topic}`);
        }
      }
    };
    game.ws.onclose = (event) => {
      // const msg = JSON.stringify({action: 'sendmessage', roomcode: game.roomcode})
      // game.ws.send(msg)
    };

    this.music = this.sound.add('startup-music');
    const musicConfig = {
      mute: false,
      volume: 0.3,
      rate: 1.05,
      detune: 0,
      seek: 0,
      loop: true,
      delay: 0
    };
    this.music.play(musicConfig);

    // BACKGROUND, TEXT, START BUTTON
    this.background = this.add.image(
      this.game.config.width / 2,
      this.game.config.height / 2,
      'space-cat'
    );
    this.background.displayWidth = window.innerWidth;
    this.background.scaleY = this.background.scaleX;

    this.btnStart = this.add.image(200, 600, 'btnStart');
    this.btnStart.setInteractive();
    this.btnStart.on('pointerdown', this.play, this);
    this.gameTitleText = this.add.text(100, 200, 'Buffoonery', {
      fontSize: '100px'
    });
    this.roomcodeTitleText = this.add.text(
      100,
      300,
      `Room code: ${game.roomcode}`,
      {
        fontSize: '50px'
      }
    );
    this.instructionalTitleText = this.add.text(
      100,
      400,
      `Go to buffoonery.io on your phone to join.`,
      {
        fontSize: '30px'
      }
    );
  }

  update() {}
}

HomeScene.prototype.createBall = createBall;
HomeScene.prototype.createBumpers = createBumpers;
HomeScene.prototype.getBall = getBall;
HomeScene.prototype.getBumpers = getBumpers;
HomeScene.prototype.checkWin = checkWin;

export default HomeScene;
