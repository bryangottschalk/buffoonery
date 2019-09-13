function getBumpers() {
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
}

export default getBumpers;
