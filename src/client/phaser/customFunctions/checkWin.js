function checkWin() {
  if (this.state.score.player1 >= 19) {
    this.scene.start('GameOver', 'player 1 wins');
    this.socket.emit('gameOver', 'player 1 wins');
  }
  if (this.state.score.player2 >= 19) {
    this.scene.start('GameOver');
    this.socket.emit('gameOver');
  }
}

export default checkWin;
