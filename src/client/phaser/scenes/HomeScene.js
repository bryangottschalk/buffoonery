/* eslint-disable spaced-comment */
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
  parent.prepend(el);
};

const setInitialChat = (comments) => {
  const parent = document.getElementById('events');
  comments.forEach((c) => {
    const el = document.createElement('li');
    el.innerHTML = `${c.name}: ${c.chatMsg}`;
    parent.appendChild(el);
  });
};

const toggleMute = (scene) => {
  console.log('🚀 ~ file: HomeScene.js ~ line 50 ~ toggleMute ~ scene', scene);
  if (!scene.music.isPlaying) {
    scene.music.play();
    scene.soundBtn.setTint('0xffffff');
  } else {
    scene.music.stop();
    scene.soundBtn.setTint('0xe0e0e0' + 50);
  }
};

class HomeScene extends Phaser.Scene {
  constructor() {
    super('Home');
  }

  preload() {
    this.disableVisibilityChange = true; // does not require focus for game to run
    document
      .querySelector('#chat-form')
      .addEventListener('submit', this.chatSubmitted);
  }

  play() {
    this.music.stop();
    this.scene.start('Main');
  }

  create() {
    const game = window.game;
    const scene = this;
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
          setInitialChat(data.comments.reverse());
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

      if (msg && msg.topic) {
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
                      return 'archer-attack';
                    case 2:
                      return 'fighter';
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
                    getCharacter(playerNumber),
                    0
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
                  game.state.players.push({
                    connectionId: msg.client.connectionId,
                    sprite: scene[`player${playerNumber}`]
                  });
                } else {
                  // is player 1
                  scene.player1 = this.physics.add.sprite(
                    200,
                    800,
                    getCharacter(playerNumber)
                  );
                  this.anims.create({
                    key: 'shoot-arrow',
                    repeat: -1,
                    frames: this.anims.generateFrameNames('archer-attack', {
                      start: 1,
                      end: 5
                    }),
                    frameRate: 10
                  });
                  scene.player1.play('shoot-arrow');
                  scene.player1.displayWidth = 350;
                  scene.player1.scaleY = scene.player1.scaleX;
                  scene.player1.setZ(5);
                  scene.player1.Name = this.add.text(100, 900, `${msg.name}`, {
                    fontSize: '25px'
                  });
                  game.state.players.push({
                    connectionId: msg.client.connectionId,
                    sprite: scene.player1
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
              const playerToRemove = game.state.players.find(
                (p) => p.connectionId === msg.connectionId
              ).sprite;
              playerToRemove.setVisible(false);
              playerToRemove.Name.destroy(); // removes text below name as well
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
    game.ws.onclose = (event) => {};

    /////////////////////////////
    // ADD MUSIC, BACKGROUND, TEXT, BUTTONS
    /////////////////////////////
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
    this.soundBtn = this.add
      .text(
        this.btnStart.x - 100,
        this.btnStart.y + 50,
        'Toggle music on/off',
        {
          fill: 'black',
          backgroundColor: '#00FF00',
          padding: 10,
          borderRadius: 10
        }
      )
      .setInteractive()
      .on('pointerdown', () => this.toggleMute(this));
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
HomeScene.prototype.toggleMute = toggleMute;
HomeScene.prototype.createBall = createBall;
HomeScene.prototype.createBumpers = createBumpers;
HomeScene.prototype.getBall = getBall;
HomeScene.prototype.getBumpers = getBumpers;
HomeScene.prototype.checkWin = checkWin;

export default HomeScene;
