function getBall() {
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

export default getBall;
