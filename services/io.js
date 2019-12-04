module.exports = {
  io: null,

  listen(server) {
    io = require('socket.io')(server);

    io.on('connection', function (socket) {
      socket.emit('connect', { hello: 'world' });
      socket.on('my other event', function (data) {
        console.log(data);
      });
    });
  }
}