import React, { useState, useEffect } from "react";

const io = require('socket.io-client');
const socket = io();


export default () => {

  let [messages, setMessages] = useState([]);
  let [username, setUsername] = useState(null);
  let [room, setRoom] = useState(null);
  let [input, setInput] = useState(null);

  useEffect(() => {
    try {
      socket.open();
      socket.on('message', (message) => { setMessages(messages => [...messages, message]) });
    }
    catch (error) {
      console.log(error);
    }
    return () => {
      socket.close();
    };

  }, []);


  return (
    <div>
      Username: <input onChange={(e) => { setUsername(e.target.value) }} />
      
      <br /><br />
      
      Room: <input onChange={(e) => { setRoom(e.target.value) }} />
      <button onClick={() => {
        socket.emit("create room", { roomname: room, username: username });
      }}>Create</button>
      <button onClick={() => {
        socket.emit("join room", { roomname: room, username: username });
      }}>Join</button>
      <button onClick={() => {
        socket.emit("leave room", room);
      }}>Leave</button>
      
      <br /><br />

      Message: <input onChange={(e) => { setInput(e.target.value) }} />
      <button onClick={() => {
        socket.emit("message", { message: input, room: room });
      }}>Send</button>
      {messages.map((msg) => <div>{msg}</div>)}

    </div>
  );
}