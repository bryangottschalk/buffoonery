import Phaser from 'phaser';
import io from 'socket.io-client';

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
      // receiving new state from server in a loop
      this.state = state;
    });
  }

  init() {}

  preload() {}

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
        font: '30px',
      }
    );
    this.text1.setOrigin(0.5, 0.5);
    if (this.state.playerCount === 1) {
      this.waitingForSecondPlayer = this.add.text(
        this.game.config.width / 2,
        this.game.config.height - 100,
        'practice mode: scoring will start when second player joins...',
        {
          font: '18px',
        }
      );
      this.waitingForSecondPlayer.setOrigin(0.5, 0.5);
    }

    // SCOREBOARD
    this.score1 = this.add.text(
      50,
      50,
      `p1 score: ${this.state.score.player1}`,
      {
        font: '20px',
      }
    );
    this.score2 = this.add.text(
      this.game.config.width - 190,
      50,
      `p2 score: ${this.state.score.player2}`,
      {
        font: '20px',
      }
    );

    /* SET UP PLAYERS */
    console.log(this.state);
    if (this.state.playerCount === 1) {
      this.isFirstPlayer = true;
      console.log('state2', this.state);
      this.waitingForSecondPlayer = this.add.text(
        this.game.config.width / 2,
        this.game.config.height - 100,
        'practice mode: scoring will start when second player joins...',
        {
          font: '18px',
        }
      );
      this.waitingForSecondPlayer.setOrigin(0.5, 0.5);
    }
    if (this.isFirstPlayer) {
      this.player1 = this.physics.add.sprite(
        100,
        this.game.config.height / 2,
        'archer'
      );
    } else {
      // get x and y from server
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

    /* CREATE OR RECEIVE BALL AND BUMPERS */
    if (this.state.playerCount === 1) {
      this.createBall(this.game.config.width / 2, this.game.config.height / 2);
      this.createBumpers();
    } else {
      // receive ball (player2)
      this.getBall();
      // await this.getBumpers();
    }
  }
  setPlayerMoveState(dir) {
    this.socket.emit('dir', dir, this.isFirstPlayer);
  }
  createBall(x, y) {
    this.ball = this.physics.add.sprite(x, y, 'orb');
    this.ball.displayWidth = 150;
    this.ball.scaleY = this.ball.scaleX;

    this.ball.body.collideWorldBounds = true;

    // this.anims.create({
    //   key: 'dance',
    //   frames: [{ key: 'monster1', frame: 0 }, { key: 'monster2', frame: 0 }],
    //   frameRate: 4,
    //   repeat: -1,
    // });
    // this.ball.play('dance');

    this.ball.setVelocity(600, 600);
    this.ball.setBounce(1, 1);
    this.ball.body.setBounce(1, 1);
    this.physics.add.collider(this.player1, this.ball, () =>
      this.this.game.sound.play('pop')
    );
    this.physics.add.collider(this.player2, this.ball, () =>
      this.this.game.sound.play('pop')
    );
  }
  getBall() {
    // player 2 receives ball state from server and creates a new ball with those x and y coordinates
    this.ball = this.physics.add.sprite(
      this.state.ball.x,
      this.state.ball.y,
      'orb'
    );
    this.ball.displayWidth = 150;
    this.ball.scaleY = this.ball.scaleX;
    this.ball.body.collideWorldBounds = true;
    this.ball.setVelocity(600, 600);
    this.ball.setBounce(1, 1);
    this.ball.body.setBounce(1, 1);
    this.physics.add.collider(this.player1, this.ball, () =>
      this.game.sound.play('pop')
    );
    this.physics.add.collider(this.player2, this.ball, () =>
      this.game.sound.play('pop')
    );
  }
  getBumpers() {
    this.bumper1 = this.physics.add.sprite(
      this.game.config.width / 2,
      this.state.bumper1.y,
      'fighter'
    );
    this.bumper2 = this.physics.add.sprite(
      this.game.config.width / 2,
      this.state.bumper2.y,
      'fighter'
    );
    this.bumper1.displayWidth = 75;
    this.bumper1.scaleY = this.bumper1.scaleX;
    this.bumper2.displayWidth = 75;
    this.bumper2.scaleY = this.bumper2.scaleX;

    this.bumper1.setVelocityY(this.speed);
    this.bumper2.setVelocityY(-this.speed);
    this.bumper1.setImmovable();
    this.bumper2.setImmovable();
    this.physics.add.collider(this.bumper1, this.ball, () =>
      console.log('hit bumper 1')
    );
    this.physics.add.collider(this.bumper2, this.ball, () =>
      console.log('hit bumper 2')
    );
  }
  createBumpers() {
    this.speed = 100;
    this.bumper1 = this.physics.add.sprite(
      this.game.config.width / 2,
      (this.game.config.height * 2) / 3,
      'fighter'
    );
    this.bumper2 = this.physics.add.sprite(
      this.game.config.width / 2,
      this.game.config.height / 3,
      'fighter'
    );
    this.bumper1.displayWidth = 75;
    this.bumper1.scaleY = this.bumper1.scaleX;
    this.bumper2.displayWidth = 75;
    this.bumper2.scaleY = this.bumper2.scaleX;

    this.bumper1.setVelocityY(this.speed);
    this.bumper2.setVelocityY(-this.speed);
    this.bumper1.setImmovable();
    this.bumper2.setImmovable();
    this.physics.add.collider(this.bumper1, this.ball);
    this.physics.add.collider(this.bumper2, this.ball);
  }
  // eslint-disable-next-line complexity
  update(time, delta) {
    this.score1.setText(`p1 score: ${this.state.score.player1}`);
    this.score2.setText(`p2 score: ${this.state.score.player2}`);

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
  checkWin() {
    if (this.state.score.player1 >= 19) {
      this.scene.start('GameOver', 'player 1 wins');
      this.socket.emit('gameOver', 'player 1 wins');
    }
    if (this.state.score.player2 >= 19) {
      this.scene.start('GameOver');
      this.socket.emit('gameOver');
    }
  }
}

export default GameScene;
