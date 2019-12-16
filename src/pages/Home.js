import React, { useState, useEffect } from 'react';
import { HTMLTable, Dialog, InputGroup, FormGroup, Button, Callout, Card } from "@blueprintjs/core";
import "./Home.css";

const io = require('socket.io-client');
const socket = io();


export default ({ }) => {

  // Username variables
  let [username, setUsername] = useState(null);
  let [usernameDialogIsOpen, setUsernameDialogIsOpen] = useState(true);
  let [usernameIsSubmit, setUsernameIsSubmit] = useState(false);

  // Room variables
  let [room, setRoom] = useState(null);
  let [rooms, setRooms] = useState([]);

  let [settingIsOpen, setSettingIsOpen] = useState(false);


  // Checks if the given username is valid
  let validateName = (usr) => !(
    usr == "" ||
    usr == null ||
    !usr.match(/^[a-zA-Z0-9]+$/) ||
    usr.length < 2 ||
    usr.length > 15
  );


  // Runs on component re-render (on load)
  useEffect(() => {

    socket.emit("get rooms");

    try {
      socket.open();
      socket.on("refresh rooms", (rooms) => { setRooms(rooms) })
    }
    catch (error) {
      console.log(error);
    }
    return () => {
      socket.close();
    };

  }, []);



  return (
    <div id="main-container">
      {/* Dialog Box to get username */}
      <Dialog isOpen={usernameDialogIsOpen} className="bp3-dark">
        {/* if user submitted username starts to check if valid and returns error message */}
        {(!validateName(username) && usernameIsSubmit) ? <Callout intent="warning">Please enter a valid username</Callout> : null}
        <FormGroup
          style={{ margin: "10px 40px 0 40px" }}
        >
          <h3>Select a username:</h3>
          <form onSubmit={e => {
            e.preventDefault();
            setUsernameIsSubmit(true);
            let input = e.target[0].value
            if (validateName(input)) {
              setUsername(input);
              localStorage.setItem("username", input);
              setUsernameDialogIsOpen(false);
            }
          }}>
            <InputGroup autoFocus defaultValue={username} />
            <br />
            <Button type="submit">Submit</Button>
          </form>
        </FormGroup>
      </Dialog>

      <h1 style={{flex:1}}>DRISK</h1>
      <Card id="rooms" elevation={4} className="bp3-dark" style={{flex:9}}>
        <div style={{ flex: 1 }}>
          <h2>Room List</h2>
          <Button intent="primary" onClick={() => { socket.emit("get rooms") }}>Refresh</Button>
          <Button intent="primary" onClick={() => { setUsernameDialogIsOpen(true) }}>Change Nickname</Button>
        </div>
        <div id="table-container" style={{ flex: "auto" }}>
          <div className="flex-row title">
            <div className="flex-col" style={{ flex: 3 }}><b>Room Name</b></div>
            <div className="flex-col" style={{ flex: 1 }}><b>Password</b></div>
            <div className="flex-col" style={{ flex: 1 }}><b>Players</b></div>
          </div>
          <div className="flex-table">
            {rooms.map((room, i) => (
              <div className="flex-row" key={i}>
                <div className="flex-col" style={{ flex: 3 }}>{room.name}</div>
                <div className="flex-col" style={{ flex: 1 }}>{room.hasPassword ? "yes" : "no"}</div>
                <div className="flex-col" style={{ flex: 1 }}>{room.userCount + " / " + room.maxUsers}</div>
              </div>
            ))}
          </div>
        </div>


        <div style={{ flex: 1 }}>

          <br /><br />
          Room: <input onChange={(e) => { setRoom(e.target.value) }} />
          <button onClick={() => {
            socket.emit("create room", { roomname: room, username: username });
            socket.emit("get rooms")
          }}>Create</button>
          <button onClick={() => {
            socket.emit("join room", { roomname: room, username: username });
          }}>Join</button>
          <button onClick={() => {
            socket.emit("leave room", { roomname: room, username: username });
          }}>Leave</button>

        </div>
      </Card>
      
    </div>
  )
}

/* Dialog to create room
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
      </Dialog>*/

/*
 <HTMLTable
          interactive="true"
          striped="true"
          bordered="true"
          style={{
            border: "1px solid black",
            margin: "auto",
          }}>

          <thead>
            <tr>
              <th>Room Name</th>
              <th>Users</th>
              <th>Max Player</th>
              <th>Password</th>
            </tr>
          </thead>
          <tbody
            style={{
              height: "500px"
            }}>
            {rooms.map((room, i) => (
              <tr key={i}>
                <td>{room.name}</td>
                <td>{room.userCount}</td>
                <td>{room.maxUsers}</td>
                <td>no</td>
              </tr>
            ))}
          </tbody>
        </HTMLTable> */
