const http = require('http');
const WebSocket = require('ws');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/alive') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('yes alive fr');
  } else {
    res.writeHead(404);
    res.end();
  }
});

const wss = new WebSocket.Server({ server });

const users = {};

wss.on('connection', socket => {
  let userId;

  socket.on('message', raw => {
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }

    if (data.type === 'init' && data.userId) {
      userId = data.userId;

      if (!users[userId]) users[userId] = new Set();
      users[userId].add(socket);

      return;
    }

    if (userId && data.type === 'message') {
      if (!users[userId]) return;

      for (const device of users[userId]) {
        if (device !== socket && device.readyState === WebSocket.OPEN) {
          device.send(JSON.stringify({
            from: userId,
            message: data.message
          }));
        }
      }
    }
  });

  socket.on('close', () => {
    if (userId && users[userId]) {
      users[userId].delete(socket);
      if (users[userId].size === 0) delete users[userId];
    }
  });
});

server.listen(8080);