import React, { useState, useEffect } from 'react';
import { HTMLTable, Dialog, InputGroup, FormGroup, Button, Callout } from "@blueprintjs/core";

const io = require('socket.io-client');
const socket = io();


export default ({ }) => {

  let [usernameDialogIsOpen, setUsernameDialogIsOpen] = useState(true);
  let [settingIsOpen, setSettingIsOpen] = useState(false);
  let [usernameIsSubmit, setUsernameIsSubmit] = useState(false);
  let [input, setInput] = useState(null);
  let [room, setRoom] = useState(null);
  let [username, setUsername] = useState(null);
  let [rooms, setRooms] = useState([]);

  let validateName = (username) => {
    if (username == "" || username == null || username[0] == " " || !username.match(/^[a-zA-Z0-9]+$/)) {
      return false;
    }
    if ((username.length < 2) || (username.length > 15)) {
      return false;

    }
    return true;
  }


  useEffect(() => {

    socket.emit("get rooms");

    try {
      socket.open();
      socket.on("refresh rooms", (rooms) => { setRooms(rooms) })
      socket.on('message', (message) => { setMessages(messages => [...messages, message]) })
    } catch (error) {
      console.log(error);
    }
    return () => {
      socket.close();
    };

  }, []);


  let a = (name) => <Callout intent="warning">Please enter a valid {name}</Callout>
  return (
    <div>
      {/* Dialog Box to get username */}
      <Dialog isOpen={usernameDialogIsOpen} canEscapeKeyClose={false}>
        {(!validateName(username) && usernameIsSubmit) ? a("username") : null}
        <FormGroup
          style={{ margin: "10px 40px 0 40px" }}
        >
          Select a username:
          <InputGroup
            onChange={(e) => { setUsername(e.target.value )}} />
          <br />
          <Button
            onClick={() => {
              setUsernameIsSubmit(true);
              if(validateName(username)) {
                localStorage.setItem("username", username);
                setUsernameDialogIsOpen(false);
              }
            }}>Submit</Button>
        </FormGroup>
      </Dialog>

      {/* Dialog to create room
      <Dialog isOpen={settingIsOpen} canOutsideClickClose canEscapeKeyClose>
        {(!validateName(room.name) && usernameIsSubmit) ? a("room name") : null}
        <FormGroup
          style={{ margin: "10px 40px 0 40px" }}
        >
          Choose Room Settings:
          <InputGroup
            onChange={(e) => { setUsername(e.target.value) }} />
          <InputGroup
            onChange={(e) => { p1 = e.target.value }} />
          <InputGroup
            onChange={(e) => { p2 = e.target.value }} />
          <br />
          <Button
            onClick={() => {
              setUsernameIsSubmit(true);
              localStorage.setItem("username", username);
              setSettingIsOpen(false);
            }}>Submit</Button>
          <br />
          Choose maximum player
          <select fill>
            <option selected>6</option>
            <option value="1">2</option>
            <option value="2">3</option>
            <option value="3">4</option>
            <option value="4">5</option>
            <option value="5">6</option>
          </select>
          <br /> <br />
          <input type="password" placeholder="Enter your password..." />
          
        </FormGroup>
      </Dialog>*/}

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
      Room: <input onChange={(e) => { setRoom(e.target.value) }} />
      <button onClick={() => {
        socket.emit("create room", { roomname: room, username: username });
      }}>Create</button>
      <button onClick={() => {
        socket.emit("join room", { roomname: room, username: username });
      }}>Join</button>
      <button onClick={() => {
        socket.emit("leave room", { roomname: room, username: username });
      }}>Leave</button>
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