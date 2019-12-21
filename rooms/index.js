module.exports = (server) => {

  const io = require('socket.io')(server);
  let rooms = [];
  let users = [];
  let checkRooms = () => {
    rooms.map((room, i) => {
      if (room.getUserCount() == 0)
        rooms.splice(i, 1)
    })
  }

  io.on('connection', socket => {
    //console.log('a user connected');

    socket.on('disconnect', () => {
      checkRooms();
    });

    socket.on("message", ({ message, room }) => {
      io.to(room).emit('message', message);
    })

    socket.on("create room", ({ roomname, maxUsers, password }) => {
      if (!rooms.map(room => room.name).includes(roomname) && roomname != null) {
        let room = new Room(io, roomname);
        room.maxUsers = maxUsers || room.maxUsers;
        room.password = password || room.password;
        rooms.push(room);
        socket.join(roomname);
      }
      else console.error("room exists");
    })

    socket.on("join room", ({ roomname, password }) => {
      let exists = false;
      rooms.map((room) => {
        if (room.name == roomname && room.maxUsers > room.getUserCount() && password == room.password) {
          socket.join(roomname);
          exists = true;
        }
      })
      if (!exists) console.error("room doesn't exist");
    })

    socket.on("leave room", ({ roomname }) => {
      socket.leave(roomname);
      checkRooms();
    })

    socket.on("get rooms", () => {
      socket.emit("refresh rooms", rooms.map(room => {
        return {
          name: room.name,
          userCount: room.getUserCount(),
          maxUsers: room.maxUsers,
          hasPassword: room.password != null
        }
      }));
    })
  });
}


class Room {
  constructor(io, name, maxUsers = 6, password = null) {
    this.name = name;
    this.maxUsers = maxUsers;
    this.password = password;
    this.io = io;
  };

  getUsers = () => this.io.sockets.adapter.rooms[this.name];
  getUserCount = () => this.getUsers() == undefined ? 0 : this.getUsers().length;

}

