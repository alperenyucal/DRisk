import React, { useState, useEffect } from 'react';
import { HTMLTable } from "@blueprintjs/core";


const io = require('socket.io-client');
const socket = io();


export default ({mapdata,}) => {

 
  let [input, setInput] = useState(null);
  let [room, setRoom] = useState(null);
  let [messages, setMessages] = useState([]);
  let [username, setUsername] = useState(null);
  let [rooms, setRooms] = useState([]);

  socket.on("message", message => {
    console.log("message-sent " + message);
  })

  useEffect(() => {

    socket.emit("get rooms");

    try {
      socket.open();
      socket.on("refresh rooms", (rooms) => {
        setRooms(rooms);
      })
      socket.on('message', (message) => {
        setMessages(messages => [...messages, message]);
      })
    } catch (error) {
      console.log(error);
    }
    return () => {
      socket.close();
    };

  }, []);

  return (
    <div>
      <h1>DRİSK</h1>

      <HTMLTable>
        <thead>
          <tr>
            <th>Room Name</th>
            <th>Users</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room, i) => (
            <tr key={i}>
              <td>{room.name}</td>
              <td>{room.userCount}</td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>

      <br /><br />
      <button onClick={() => { socket.emit("get rooms") }}>get rooms</button>
      Username: <input onChange={(e) => { setUsername(e.target.value) }} />
      <br /><br />
      Join Room: <input onChange={(e) => { setRoom(e.target.value) }} />
      <button onClick={() => {
        socket.emit("create room", { roomname: room, username: username });
      }}>Create</button>
      <button onClick={() => {
        socket.emit("join room", { roomname: room, username: username });
      }}>Join</button>
      <button onClick={() => {
        socket.emit("leave room", { roomname: room, username: username });
      }}>Leave</button>
      <br />
      <br />

      Message: <input onChange={(e) => { setInput(e.target.value) }} />
      <button onClick={() => {
        socket.emit("message", { message: input, room: room });
      }}>Send</button>
      {messages.map((msg) => <div>{msg}</div>)}

    </div>
  )
}

/*

  {rooms}
      <br/><br/>
      <button onClick={() => { socket.emit("get rooms") }}>get rooms</button>
      Username: <input onChange={(e) => { setUsername(e.target.value) }} />
      <br /><br />
      Join Room: <input onChange={(e) => { setRoom(e.target.value) }} />
      <button onClick={() => {
        socket.emit("create room", { roomname: room, username: username });
      }}>Create</button>
      <button onClick={() => {
        socket.emit("join room", { roomname: room, username: username });
      }}>Join</button>
      <button onClick={() => {
        socket.emit("leave room", {roomname: room, username: username});
      }}>Leave</button>
      <br />
      <br />


 try {
      socket.open();
      socket.on('message', (message) => {
        setMessages(messages => [...messages, message]);
      })
    } catch (error) {
      console.log(error);
    }
    return () => {
      socket.close();
    };

<div>
      Username: <input onChange={(e) => { setUsername(e.target.value) }} />
      <br /><br />
      Join Room: <input onChange={(e) => { setRoom(e.target.value) }} />
      <button onClick={() => {
        socket.emit("create room", { roomname: room, username: username });
      }}>Create</button>
       <button onClick={() => {
        socket.emit("join room", { roomname: room, username: username });
      }}>Join</button>
      <button onClick={() => {
        socket.emit("leave room", room);
      }}>Leave</button>
      <br />
      <br />

      Message: <input onChange={(e) => { setInput(e.target.value) }} />
      <button onClick={() => {
        socket.emit("message", { message: input, room: room });
      }}>Send</button>
      {messages.map((msg) => <div>{msg}</div>)}



    </div>



*/