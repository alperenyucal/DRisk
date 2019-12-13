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

    socket.on("create room", ({ roomname, username, maxUsers }) => {
      if (!rooms.map(room => room.name).includes(roomname) && username != null && roomname != null) {
        let room = new Room(roomname);
        room.addUser(username);
        room.maxUsers = maxUsers;
        rooms.push(room);
        socket.join(roomname);
      }
      else console.error("room exists");
      console.log(rooms);
    })

    socket.on("join room", ({ roomname, username }) => {
      let exists = false;
      rooms.map((room) => {
        if (room.name == roomname && username != null &&
           !room.users.includes("username") && room.maxUsers > room.users.length) {
          socket.join(roomname);
          room.addUser(username);
          exists = true;
        }
      })
      if (!exists) console.error("room doesn't exist");
      console.log(rooms);
    })

    socket.on("leave room", ({ roomname, username }) => {
      rooms.map((room, i) => {
        if (room.name == roomname)
          room.removeUser(username);
        if (room.users.length == 0) {
          rooms.splice(i, 1);
        }
      });
      socket.leave(roomname);
      console.log(rooms);

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
  constructor(name, maxUsers, password = null) {
    this.name = name;
    this.users = [];
    this.maxUsers = maxUsers;
    this.password = password;
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