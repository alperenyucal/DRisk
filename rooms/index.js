module.exports = (server) => {

  const io = require('socket.io')(server);
  let rooms = [];

  io.on('connection', socket => {
    console.log('a user connected');
    console.log(socket.id);

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

    socket.on("message", ({ message, room }) => {
      io.to(room).emit('message', message);
    })

    socket.on("create room", ({ roomname, username }) => {
      if (!rooms.map(room => room.name).includes(roomname)) {
        let room = new Room(roomname);
        room.addUser(username);
        rooms.push(room);
        socket.join(roomname);
      }
      else console.error("room exists");
      console.log(rooms);
    })

    socket.on("join room", ({ roomname, username }) => {
      let exists = false;
      rooms.map((room) => {
        if (room.name == roomname) {
          socket.join(roomname);
          room.addUser(username);
          exists = true;
        }
      })
      if (!exists) console.error("room doesn't exist");
      console.log(rooms);
    })

    socket.on("leave room", ({ roomname, username }) => {
      socket.leave(roomname);
    })

    socket.on("get rooms", () => {
      socket.emit("refresh rooms", rooms.map(room => {
        return {
          name: room.name,
          userCount: room.users.length
        }
      }));
    })
  });

}


class Room {
  constructor(name) {
    this
    this.name = name;
    this.users = [];
  };

  addUser(username) {
    if (!this.users.includes(username))
      this.users.push(username);
  }

  removeUser(username) {
    let i = this.users.indexOf(username);
    this.users.splice(i, 1);
  }

}