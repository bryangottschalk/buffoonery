function chatSubmitted(e, socket) {
  e.preventDefault(); // don't need to submit and reload the page --> we will handle the data ourselves
  const input = document.querySelector('#chat');
  const text = input.value;
  input.value = '';
  socket.emit('message', text); // send message to server with payload of string text
}

export default chatSubmitted;
