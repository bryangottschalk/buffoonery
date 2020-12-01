/* eslint-disable complexity */
import Phaser from 'phaser';
import io from 'socket.io-client';
import createBall from '../customFunctions/createBall';
import createBumpers from '../customFunctions/createBumpers';
import getBall from '../customFunctions/getBall';
import getBumpers from '../customFunctions/getBumpers';
import checkWin from '../customFunctions/checkWin';

class HomeScene extends Phaser.Scene {
  constructor() {
    super('Home');
    this.state = {
      score: {
        player1: 0,
        player2: 0,
      },
      playerOneState: {
        direction: null,
      },
      playerTwoState: {
        direction: null,
      },
      playerIds: [],
      playerCount: 0,
    };
    this.socket = io('http://localhost:8080');
    this.socket.on('state', state => {
      // LISTENING FOR STATE FROM SERVER
      const parent = document.getElementById('num-players');
      if (parent.childElementCount > 0) {
        document.getElementById('test').innerHTML = state.playerCount
      } else {
        const el = document.createElement('div');
        el.id = 'test'
        el.innerHTML = state.playerCount;
        parent.appendChild(el);
      }
      
      this.state = state;
    });
    console.log("🚀 ~ file: HomeScene.js ~ line 44 ~ HomeScene ~ constructor ~ this.state", this.state)
    this.socket.on('p2joined', () => {
      // scoring starts when p2 joins
      if (this.isFirstPlayer) {
        this.waitingForSecondPlayer.setVisible(false);
      }
    });
    this.socket.on('connection', () => {
      console.log('connected')
    })
    this.socket.on('disconnect', () => {
      console.log('disconnection')
    })
    this.socket.on('message', text => {
      // listens for message from server
      const parent = document.getElementById('events');
      const el = document.createElement('li');
      el.innerHTML = text;
      parent.appendChild(el);
    });
    this.socket.on('gameOverMessage', text => {
      const parent = document.getElementById('events');
      const el = document.createElement('li');
      el.innerHTML = text;
      parent.appendChild(el);
    });
    this.chatSubmitted = this.chatSubmitted.bind(this);
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
    this.socket.emit('message', text); // send message to server with payload of string text
  }

  play() {
    this.music.stop()
    this.scene.start('Main');
  }
  create() {
    console.log('ws', this.game.ws)
    this.music = this.sound.add('startup-music');
    const musicConfig = {
      mute: false,
      volume: 0.3,
      rate: 1.05,
      detune: 0,
      seek: 0,
      loop: true,
      delay: 0,
    };
    this.music.play(musicConfig);
    // BACKGROUND
    this.background = this.add.image(
      this.game.config.width / 2,
      this.game.config.height / 2,
      'space-cat'
    );
    this.background.displayWidth = window.innerWidth;
    this.background.scaleY = this.background.scaleX;

    this.btnStart = this.add.image(
      200,
      600,
      'btnStart'
    );
    this.btnStart.setInteractive();
    this.btnStart.on('pointerdown', this.play, this);
    this.text1 = this.add.text(
      100,
      200,
      'Buffoonery',
      {
        fontSize: '100px',
      }
    );
    this.text2 = this.add.text(
      100,
      300,
      'Room code: 6FBC',
      {
        fontSize: '50px',
      }
    );



  }

  update() {

  }
}

HomeScene.prototype.createBall = createBall;
HomeScene.prototype.createBumpers = createBumpers;
HomeScene.prototype.getBall = getBall;
HomeScene.prototype.getBumpers = getBumpers;
HomeScene.prototype.checkWin = checkWin;

export default HomeScene;
