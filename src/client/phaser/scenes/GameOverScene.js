import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }
  create() {
    this.btnPlayAgain = this.add.image(
      this.game.config.width / 2,
      this.game.config.height / 2,
      'playAgain'
    );
    this.btnPlayAgain.setInteractive();
    this.btnPlayAgain.on('pointerdown', this.playAgain, this);
  }
  playAgain() {
    this.scene.start('SceneMain');
  }
  update() {}
}
