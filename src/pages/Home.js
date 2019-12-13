import React, { useState, useEffect } from 'react';
import { HTMLTable, Dialog, InputGroup, FormGroup, Button, Callout } from "@blueprintjs/core";

const io = require('socket.io-client');
const socket = io();


export default ({ mapdata, }) => {

  let [usernameDialogIsOpen, setUsernameDialogIsOpen] = useState(true);
  let [settingIsOpen, setSettingIsOpen] = useState(false);
  let [usernameIsSubmit, setUsernameIsSubmit] = useState(false);
  let [input, setInput] = useState(null);
  let [room, setRoom] = useState(null);
  let [messages, setMessages] = useState([]);
  let [username, setUsername] = useState(null);
  let [rooms, setRooms] = useState([]);

  let validateUsername = (username) => {
    if (username == ""  || username == null || username[0] == " " || !username.match(/^[a-zA-Z0-9]+$/)) {
      //alert("Please Enter Your Name");
      //document.form.name.focus();
      return false;
    }
    if ((username.length < 2) || (username.length > 15)) {
      //alert("Your Character must be 5 to 15 Character");
      //document.form.name.select();
      return false;

    }
    return true;
  }

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


  let a = <Callout intent="warning">Please enter a valid username.</Callout>

  return (
    <div>
      {/* Dialog Box to get username*/}
      <Dialog isOpen={usernameDialogIsOpen} canEscapeKeyClose={false}>
        {(!validateUsername(username) && usernameIsSubmit)? a : null}
        <FormGroup
          style={{ margin: "10px 40px 0 40px" }}
        >
          Select a username:
          <InputGroup
            onChange={(e) => { setUsername(e.target.value) }} />
          <br />
          <Button
            onClick={() => {
              setUsernameIsSubmit(true);
              if(validateUsername(username)) {
                localStorage.setItem("username", username);
                setUsernameDialogIsOpen(false);
              }
            }}>Submit</Button>
        </FormGroup>
      </Dialog>

      <Dialog isOpen={settingIsOpen} canOutsideClickClose = "true" canEscapeKeyClose = "true" >
        {(!validateUsername(username) && usernameIsSubmit)? a : null}
        <FormGroup
          style={{ margin: "10px 40px 0 40px" }}
        >
          Choose Room Settings:
          <InputGroup
            onChange={(e) => { setUsername(e.target.value) }} />
          <br />
          <Button
            onClick={() => {
              setUsernameIsSubmit(true);
              if(validateUsername(username)) {
                localStorage.setItem("username", username);
                setSettingIsOpen(false);
              }
            }}>Submit</Button>
        </FormGroup>
      </Dialog>
      
      <h1>DRISK</h1>
      
      <HTMLTable interactive="true" striped="true" bordered="true">

        <thead>
          <tr>
            <th>Room Name</th>
            <th>Users</th>
            <th>Max Player</th>
            <th>Password</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room, i) => (
            <tr key={i}>
              <td>{room.name}</td>
              <td>{room.userCount}</td>
              <td>{room.maxUsers}</td>
              <td>no</td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>

      <br /><br />
      <button onClick={() => { socket.emit("get rooms") }}>get rooms</button>
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
      {messages.map((msg) => <div><h1>datetime.datetime.now()</h1>{msg}</div>)}

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