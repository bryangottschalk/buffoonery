// const express = require('express');
// const app = express();
// const server = require('http').Server(app);
// const io = require('socket.io').listen(server);

// const state = {
//   score: {
//     player1: 0,
//     player2: 0,
//   },
//   playerOneState: {
//     direction: null,
//   },
//   playerTwoState: {
//     direction: null,
//   },
//   playerIds: [],
//   playerCount: 0,
// };

// io.on('connection', socket => {
//   console.log('Someone connected', socket.id);

//   if (!state.playerIds.includes(socket.id)) {
//     state.playerIds.push(socket.id);
//     state.playerCount++;
//     console.log('num players', state.playerCount);
//   }
//   socket.on('disconnect', () => {
//     console.log('a player disconnected');
//     const i = state.playerIds.indexOf(socket.id);
//     state.playerIds.splice(i, 1);
//     state.playerCount--;
//     console.log('num players:', state.playerCount);
//     // reset score when lobby is empty
//     if (state.playerCount === 0) {
//       state.score = {
//         player1: 0,
//         player2: 0,
//       };
//     }
//   });

//   // handle messages from any client
//   socket.emit(
//     'message',
//     `Welcome! Buffoonery fully supports trash talk so have at it.`
//   ); // emits to one person
//   socket.on('message', text => {
//     // handle messages from single client
//     io.emit(
//       'message',
//       `player ${state.playerIds.indexOf(socket.id) + 1}: ${text}`
//     ); // send chat message to everyone that is connected, including client itself
//     // if this were socket.emit it would send the message to a particular client
//   });

//   socket.on('p1scored', () => {
//     state.score.player1++;
//     io.emit('p1scored');
//   });
//   socket.on('p2scored', () => {
//     state.score.player2++;
//     io.emit('p2scored');
//   });

//   socket.on('gameOver', winningPlayerMessage => {
//     console.log(winningPlayerMessage);
//     io.emit('gameOverMessage', winningPlayerMessage);
//     state.score = {
//       player1: 0,
//       player2: 0,
//     };
//   });
// });

// setInterval(() => {
//   io.emit('state', state);
// }, 3000);

// server.on('error', err => {
//   console.error('Server error:', err);
// });

// server.listen(process.env.PORT || 8080, function() {
//   console.log('Listening on ' + server.address().port);
// });
