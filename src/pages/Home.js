import React, { useState, useEffect } from 'react';
import { Dialog, InputGroup, FormGroup, Button, Callout, Card } from "@blueprintjs/core";
import Game from "./Game";
import "./Home.css";

export default ({ io, socket }) => {

  // Username variables
  let [username, setUsername] = useState(null);
  let [usernameDialogIsOpen, setUsernameDialogIsOpen] = useState(true);
  let [showUsernameError, setshowUsernameError] = useState(false);

  // Room variables
  let [selectedRoom, setSelectedRoom] = useState(null);
  let [rooms, setRooms] = useState([]);
  let [room, setRoom] = useState({
    maxUsers: 6,
    userCount: 0
  });
  let [roomRedirect, setRoomRedirect] = useState(false);
  let [roomDialogIsOpen, setRoomDialogIsOpen] = useState(false);
  let [joinDialogIsOpen, setJoinDialogIsOpen] = useState(false);
  let [waitingDialogIsOpen, setWaitingDialogIsOpen] = useState(false);
  let [showCreateRoomError, setCreateRoomError] = useState(false);


  let [map, setMap] = useState(null);
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

    fetch("/static/map.json")
    .then(res => res.json())
    .then(data => {
      data.regions = data.regions.map((region) => {
        return {
          id: region.id,
          name: region.name,
          nodes: region.nodes.map((node) => { return { x: (node.x * 40), y: (node.y * 30) } }),
          neighbours: region.neighbours,
          continentId: region.continentId
        }
      })
      setMap(data);
    });

    socket.emit("get rooms");

    try {
      socket.open();
      socket.on("refresh rooms", (rooms) => { setRooms(rooms) })
      socket.on("load game", () => { setRoomRedirect(true) });
      socket.on("room", room => { setRoom(room) });
    }
    catch (error) {
      console.error(error);
    }
    return () => {
      socket.close();
    };

  }, []);


  return roomRedirect ? <Game map={map} socket={socket} /> : (
    <div id="main-container">
      {/* Dialog Box to get username */}
      <Dialog
        isOpen={usernameDialogIsOpen}
        className="bp3-dark">
        {/* if user submitted username starts to check if valid and returns error message */}
        {showUsernameError ? <Callout intent="warning">Please enter a valid username</Callout> : null}
        <FormGroup
          style={{ margin: "10px 40px 0 40px" }}
        >
          <h3>Select a username:</h3>
          <form onSubmit={e => {
            e.preventDefault();
            setshowUsernameError(true);
            let input = e.target[0].value
            if (validateName(input)) {
              setUsername(input);
              localStorage.setItem("username", input);
              setUsernameDialogIsOpen(false);
              setshowUsernameError(false);
              socket.emit("set username", input);
            }
          }}>
            <InputGroup autoFocus defaultValue={username} />
            <br />
            <Button type="submit">Submit</Button>
          </form>
        </FormGroup>
      </Dialog>

      <Dialog
        isOpen={roomDialogIsOpen}
        canOutsideClickClose={true}
        canEscapeKeyClose={true}
        onClose={() => {
          setRoomDialogIsOpen(false);
        }}
        className="bp3-dark">
        {showCreateRoomError ? <Callout intent="warning">Please enter a valid Room Name and Max Players (2 to 6)</Callout> : null}
        <FormGroup
          style={{ margin: "10px 40px 0 40px" }}
        >
          <h3>
            Create New Room
            <Button
              intent="danger"
              onClick={() => { setRoomDialogIsOpen(false) }}
              style={{ float: "right" }}
            >
              X
            </Button>
          </h3>
          <hr></hr>
          <form onSubmit={e => {
            e.preventDefault();
            let rm = e.target[0].value;
            let maxUsers = e.target[1].value;
            let pass = e.target[2].value;
            if (
              rm == "" ||
              rm == null ||
              !rm.match(/^[a-zA-Z0-9]+$/) || // !!! add space
              rm.length < 2 ||
              rm.length > 15 ||
              maxUsers.length > 1 ||
              maxUsers < 2 ||
              maxUsers > 6
            ) {
              setCreateRoomError(true);
            }
            else {
              socket.emit("create room", { roomname: rm, password: pass, maxUsers: maxUsers });
              socket.emit("get rooms");
              setRoomDialogIsOpen(false);
              setWaitingDialogIsOpen(true);
              setCreateRoomError(false);
            }
          }}>
            <h4>Room Name:</h4>
            <InputGroup defaultValue="NewRoom" />
            <h4>Max Players:</h4>
            <InputGroup defaultValue={6} />
            <h4>Password:</h4>
            <InputGroup type="password" />
            <br />
            <Button type="submit">Submit</Button>
          </form>
        </FormGroup>
      </Dialog>

      <Dialog
        isOpen={joinDialogIsOpen}
        canOutsideClickClose={true}
        canEscapeKeyClose={true}
        onClose={() => {
          setJoinDialogIsOpen(false);
        }}
        className="bp3-dark">
        <FormGroup
          style={{ margin: "10px 40px 0 40px" }}
        >
          <h3>
            Join Room
            <Button
              intent="danger"
              onClick={() => { setJoinDialogIsOpen(false) }}
              style={{ float: "right" }}
            >
              X
            </Button>
          </h3>
          <form onSubmit={e => {
            e.preventDefault();
            let pass = e.target[0].value;

            socket.emit("join room", { roomname: selectedRoom, password: (pass == "") ? null : pass });
            setJoinDialogIsOpen(false);
            setWaitingDialogIsOpen(true);

          }}>
            <h4>Room Name: <span style={{ color: "gray" }}>{selectedRoom}</span></h4>

            <h4>Password:</h4>
            <InputGroup type="password" />
            <br />
            <Button type="submit">Submit</Button>
          </form>
        </FormGroup>
      </Dialog>

      <Dialog
        className="bp3-dark"
        isOpen={waitingDialogIsOpen}
        style={{ padding: "20px" }}
      >
        Waiting for other players...<br />
        users: {room.userCount} / {room.maxUsers}
      </Dialog>

      <h1 style={{ flex: 1 }}>DRISK</h1>
      <Card id="rooms" elevation={4} className="bp3-dark" style={{ flex: 9 }}>
        <div style={{ flex: 1 }}>
          <h2>Room List</h2>
          <Button intent="primary" onClick={() => { socket.emit("get rooms") }}>Refresh</Button>
          <Button intent="primary" onClick={() => { setUsernameDialogIsOpen(true) }}>Change Username</Button>
          <Button intent="primary" onClick={() => { setRoomDialogIsOpen(true) }}>Create Room</Button>
          <Button intent="primary" onClick={() => { if (selectedRoom != null) setJoinDialogIsOpen(true) }}>Join Room</Button>
        </div>
        <div id="table-container" style={{ flex: "auto" }}>
          <div className="flex-row title">
            <div className="flex-col" style={{ flex: 3 }}><b>Room Name</b></div>
            <div className="flex-col" style={{ flex: 1 }}><b>Password</b></div>
            <div className="flex-col" style={{ flex: 1 }}><b>Players</b></div>
          </div>
          <div className="flex-table">
            {rooms.map((room, i) => (
              <div
                className={(selectedRoom == room.name && selectedRoom != null) ? "selected " : "flex-row"}
                key={i}
                onClick={
                  () => { setSelectedRoom(room.name) }
                }>
                <div className="flex-col" style={{ flex: 3 }}>{room.name}</div>
                <div className="flex-col" style={{ flex: 1 }}>{room.hasPassword ? "yes" : "no"}</div>
                <div className="flex-col" style={{ flex: 1 }}>{room.userCount + " / " + room.maxUsers}</div>
              </div>
            ))}
          </div>
        </div>

      </Card>

    </div >
  )
}
