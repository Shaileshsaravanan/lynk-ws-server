const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

server.on('connection', socket => {
  socket.on('message', message => {
    socket.send(`Echo: ${message}`);
  });

  socket.send('Connected to WebSocket server');
});