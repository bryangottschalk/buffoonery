function createBumpers() {
  console.log('this in create bumpers', this);
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

export default createBumpers;
