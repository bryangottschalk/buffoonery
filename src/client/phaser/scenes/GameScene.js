/* eslint-disable complexity */
import Phaser from 'phaser';
import io from 'socket.io-client';
import createBall from '../customFunctions/createBall';
import createBumpers from '../customFunctions/createBumpers';
import getBall from '../customFunctions/getBall';
import getBumpers from '../customFunctions/getBumpers';
import checkWin from '../customFunctions/checkWin';

class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
    this.state = {
      score: {
        player1: 0,
        player2: 0,
      },
      playerOneState: {
        direction: null,
        x: 100,
        y: 360,
      },
      playerTwoState: {
        direction: null,
      },
      playerCount: 0,
      playerId: null,
      ball: {
        x: 0,
        y: 0,
      },
      bumper1: {
        y: 0,
      },
      bumper2: {
        y: 0,
      },
    };
    this.socket = io('http://localhost:8080');
    this.socket.on('state', state => {
      // LISTENING FOR STATE FROM SERVER
      this.state = state;
    });
    this.socket.on('p2joined', () => {
      if (this.isFirstPlayer) {
        this.waitingForSecondPlayer.setVisible(false);
      }
    });
    this.socket.on('p1scored', () => {
      this.score1.setText(`p1 score: ${this.state.score.player1}`);
    });
    this.socket.on('p2scored', () => {
      this.score2.setText(`p2 score: ${this.state.score.player2}`);
    });
  }

  preload() {
    this.disableVisibilityChange = true; // does not require focus for game to run
  }

  // eslint-disable-next-line max-statements
  create() {
    // BACKGROUND
    this.background = this.add.image(
      this.game.config.width / 2,
      this.game.config.height / 2,
      'forest'
    );
    this.background.displayWidth = 1400;
    this.background.scaleY = this.background.scaleX;

    // SET PLAYERS
    if (this.state.playerCount === 1) {
      this.isFirstPlayer = true;
      this.waitingForSecondPlayer = this.add.text(
        this.game.config.width / 2,
        this.game.config.height - 100,
        'practice mode: scoring will start when second player joins...',
        {
          fontSize: '18px',
        }
      );
      this.waitingForSecondPlayer.setOrigin(0.5, 0.5);
      this.waitingForSecondPlayer.setVisible(false);
    }

    this.input.keyboard.on('keydown_UP', () => this.setPlayerMoveState('up'));
    this.input.keyboard.on('keyup_UP', () => this.setPlayerMoveState(null));
    this.input.keyboard.on('keydown_DOWN', () =>
      this.setPlayerMoveState('down')
    );
    this.input.keyboard.on('keyup_DOWN', () => this.setPlayerMoveState(null));

    // TEXT HEADING
    this.text1 = this.add.text(
      this.game.config.width / 2,
      50,
      'Crystal Baller',
      {
        fontSize: '30px',
      }
    );
    this.text1.setOrigin(0.5, 0.5);

    // SCOREBOARD
    this.score1 = this.add.text(
      50,
      50,
      `p1 score: ${this.state.score.player1}`,
      {
        fontSize: '20px',
      }
    );
    this.score2 = this.add.text(
      this.game.config.width - 190,
      50,
      `p2 score: ${this.state.score.player2}`,
      {
        fontSize: '20px',
      }
    );

    // SET UP PLAYERS
    if (this.state.playerCount === 1) {
      this.isFirstPlayer = true;
      this.player1 = this.physics.add.sprite(
        100,
        this.game.config.height / 2,
        'archer'
      );
      this.waitingForSecondPlayer = this.add.text(
        this.game.config.width / 2,
        this.game.config.height - 100,
        'practice mode: scoring will start when second player joins...',
        {
          fontSize: '18px',
        }
      );
      this.waitingForSecondPlayer.setOrigin(0.5, 0.5);
    }
    if (!this.isFirstPlayer) {
      // if p2, get p1's location from server
      this.player1 = this.physics.add.sprite(
        100,
        this.state.playerOneState.y,
        'archer'
      );
    }
    this.player1.displayWidth = 175;
    this.player1.displayHeight = 175;
    this.player1.setImmovable();
    this.player1.body.collideWorldBounds = true;

    this.player2 = this.physics.add.sprite(
      980,
      this.game.config.height / 2,
      'wizard'
    );
    this.player2.displayWidth = 150;
    this.player2.scaleY = this.player2.scaleX;
    this.player2.setImmovable();
    this.player2.body.collideWorldBounds = true;
    this.socket.emit('playerTwoConnected', this.player2.x, this.player2.y);

    // CREATE OR RECEIVE BALL AND BUMPERS
    if (this.state.playerCount === 1) {
      // p1 creates ball
      this.createBall(this.game.config.width / 2, this.game.config.height / 2);
      this.createBumpers();
    } else {
      // player 2 receives ball state from server and creates a new ball with those x and y coordinates
      this.getBall();
      this.getBumpers();
    }
  }
  setPlayerMoveState(dir) {
    this.socket.emit('dir', dir, this.isFirstPlayer);
  }

  update() {
    if (this.state.playerOneState.direction === 'up') {
      this.player1.y -= 20;
    } else if (this.state.playerOneState.direction === 'down') {
      this.player1.y += 20;
    }
    if (this.state.playerTwoState.direction === 'up') {
      this.player2.y -= 20;
    } else if (this.state.playerTwoState.direction === 'down') {
      this.player2.y += 20;
    }
    if (this.isFirstPlayer) {
      this.socket.emit('ballMoved', this.ball.x, this.ball.y);
      this.socket.emit('p1moved', this.player1.x, this.player1.y);
      this.socket.emit('bumpersMoved', this.bumper1.y, this.bumper2.y);
    } else {
      this.ball.x = this.state.ball.x;
      this.ball.y = this.state.ball.y;
      this.bumper1.y = this.state.bumper1.y;
      this.bumper2.y = this.state.bumper2.y;
    }
    if (this.ball.body.blocked.right && this.state.playerCount > 1) {
      this.socket.emit('p1scored');
      this.checkWin();
    }
    if (this.ball.body.blocked.left && this.state.playerCount > 1) {
      this.socket.emit('p2scored');
      this.checkWin();
    }
    if (this.isFirstPlayer && this.bumper1.y > this.game.config.height) {
      this.bumper1.setVelocityY(-this.speed);
    }
    if (this.isFirstPlayer && this.bumper1.y < 0) {
      this.bumper1.setVelocityY(this.speed);
    }
    if (this.isFirstPlayer && this.bumper2.y > this.game.config.height) {
      this.bumper2.setVelocityY(-this.speed);
    }
    if (this.isFirstPlayer && this.bumper2.y < 0) {
      this.bumper2.setVelocityY(this.speed);
    }
  }
}

GameScene.prototype.createBall = createBall;
GameScene.prototype.createBumpers = createBumpers;
GameScene.prototype.getBall = getBall;
GameScene.prototype.getBumpers = getBumpers;
GameScene.prototype.checkWin = checkWin;

export default GameScene;
