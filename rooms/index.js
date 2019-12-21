module.exports = (server) => {

  const io = require("socket.io")(server);

  // array of rooms
  let rooms = [];

  // checks if there are users in the room. if no user left then removes room. 
  let checkRooms = () => {
    rooms.map((room, i) => {
      if (room.getUserCount() == 0)
        rooms.splice(i, 1)
    })
  }

  // array of users. the array stores users in {socketId, username} format.
  let users = [];

  // finds the user index using socketId.
  let getUserIndex = (socketId) => users.findIndex(user => user.socketId == socketId)


  // Room class
  class Room {
    constructor(io, name, maxUsers = 6, password = null) {
      this.name = name;
      this.maxUsers = maxUsers;
      this.password = password;
      this.io = io;
    };

    // list of sockets connected to room.
    getUsers = () =>
      this.io.sockets.adapter.rooms[this.name] == undefined ? null :
        Object.keys(this.io.sockets.adapter.rooms[this.name].sockets).map(scktid => users[getUserIndex(scktid)]);

    // count of users connected to room.
    getUserCount = () => this.getUsers() == null ? 0 : this.getUsers().length;

    getRoomDetails = () => {
      return {
        name: this.name,
        maxUsers: this.maxUsers,
        userCount: this.getUserCount(),
        users: this.getUsers()
      }
    };

  }


  io.on("connection", socket => {
    // user gets connected

    // pushes user to users
    users.push({
      socketId: socket.id,
      username: "newUser"
    })

    // deletes user and checks rooms.
    socket.on("disconnect", () => {
      users.splice(getUserIndex(socket.id), 1);
      checkRooms();
    });

    // changes users username.
    socket.on("set username", (username) => {
      users[getUserIndex(socket.id)].username = username;
    })

    socket.on("message", ({ message, room }) => {
      io.to(room).emit('message', message);
    })

    // creates a new room. 
    socket.on("create room", ({ roomname, maxUsers, password }) => {
      if (!rooms.map(room => room.name).includes(roomname) && roomname != null) {
        let room = new Room(io, roomname);
        room.maxUsers = maxUsers || room.maxUsers;
        room.password = password || room.password;
        rooms.push(room);
        socket.join(roomname);
        io.to(room.name).emit("room", room.getRoomDetails());
      }
      else console.error("room exists");
    })

    // joins user to a room.
    socket.on("join room", ({ roomname, password }) => {
      let exists = false;
      rooms.map((room) => {
        if (room.name == roomname && room.maxUsers > room.getUserCount() && password == room.password) {
          socket.join(roomname);
          if (room.maxUsers == room.getUserCount())
            io.to(room.name).emit("load game", { users: room.getUsers() });
          io.to(room.name).emit("room", room.getRoomDetails());
          exists = true;
        }
      })
      if (!exists) console.error("room doesn't exist");
    })

    // disconnects user from room.
    socket.on("leave room", ({ roomname }) => {
      socket.leave(roomname);
      let room = rooms.find(rm => rm.name == roomname);
      io.to(room.name).emit("room", room.getRoomDetails());
      checkRooms();
    })

    // returns a list of rooms
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
