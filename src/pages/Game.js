import React, { useEffect, useState } from "react";
import Map from "../components/Map";
import Region from "../components/Region";
import MiniChat from "../components/MiniChat";
import "./Game.css"
import { Button, Dialog } from "@blueprintjs/core";


const usercolors = ["red", "blue", "yellow", "green", "black", "purple"];

export default ({ user, room, map, socket }) => {

  let [regions, setRegions] = useState(map.regions.map(region => {
    return Object.assign(region, {
      soldierCount: 0,
      occupiedById: null
    })
  }))

  // Game state
  let [continents, setContinents] = useState(map.continents);
  let [users, setUsers] = useState(room.users);
  let [turn, setTurn] = useState(users[0]);
  let [isFinished, setIsFinished] = useState(false);
  let [isStarted, setStarted] = useState(false);
  let [stage, setStage] = useState("soldierDist"); // ["soldierDist", "placement", "attack", "replacement"]

  // UI state
  let [isStartDialogOpen, setStartIsOpen] = useState(true);
  let [regionActive, setRegionActive] = useState(map.regions.map(() => false));


  const isMyturn = () => user.socketId == turn.socketId;


  const getMyName = () => user == null ? null : user.username;


  const getUserData = (sckt) => {
    let u = users.find(usr => usr.socketId == sckt);

    return u || {
      username: null,
      socketId: null,
      soldiersToPlace: null,
      color: null,
    };
  };

  const startHandler = () => {
    let totalSoldiers = 3 * (regions.length);
    totalSoldiers -= totalSoldiers % users.length;
    let userSoldiers = totalSoldiers / users.length;

    // sets users
    socket.emit("set users", {
      roomname: room.name,
      users: users.map((usr, i) => Object.assign(usr, {
        soldiersToPlace: userSoldiers,
        color: usercolors[i]
      }))
    })

    // region distribution at start
    let regionPerUser = users.map(() => Math.floor(regions.length / users.length));
    let extraRegionCount = regions.length % users.length;

    for (let i = 0; i < extraRegionCount; i++) regionPerUser[i]++;

    let temp = [...regions];

    users.map((user, index) => {
      for (let i = 0; i < regionPerUser[index]; i++) {
        let randomIndex = Math.floor((Math.random() * temp.length))
        let reg = temp[randomIndex];
        assignRegionToUser(reg.id, user.socketId);
        placeSoldiersToRegion(reg.id, user.socketId, 1);
        temp.splice(randomIndex, 1);
      }
    })

    // now start
    socket.emit("set started", { roomname: room.name, isStarted: true });
    startSoldierDist();
  };

  const startSoldierDist = () => {
    setRegionActive(regions.map(rg => rg.occupiedById == user.socketId));
  };

  const placeSoldiersToRegion = (rgn, sckt, sldrs) => {
    let temp = [...users];
    temp.find(usr => usr.socketId == sckt).soldiersToPlace -= sldrs;
    socket.emit("set users", { roomname: room.name, users: temp });
    temp = [...regions];
    temp.find(rg => rg.id == rgn).soldierCount += sldrs;
    socket.emit("set regions", { roomname: room.name, regions: temp });
  };

  const assignRegionToUser = (rgn, sckt) => {
    let temp = [...regions];
    temp.find(rg => rg.id == rgn).occupiedById = sckt;
    socket.emit("set regions", { roomname: room.name, regions: temp });
  }

  const endTurn = () => {
    socket.emit("set turn", {
      roomname: room.name,
      turn: users[(users.findIndex(usr => usr.socketId == user.socketId) + 1) % users.length]
    });

    setRegionActive(regionActive.map(() => false));
  }

  useEffect(() => {

    try {
      // events
      socket.on("set regions", (rgns) => { setRegions(rgns); })
      socket.on("set started", (strd) => {
        setStarted(strd);
        setStartIsOpen(false);
      })
      socket.on("set finished", (fnsd) => { setIsFinished(fnsd); })
      socket.on("set turn", (trn) => { setTurn(trn); })
      socket.on("set continents", (cntnts) => { setContinents(cntnts); })
      socket.on("set users", (usrs) => { setUsers(usrs); })

    }
    catch (error) {
      console.error(error);
    }

  })

  const SoldierDistUI = () => (
    <div>
      <Button>place soldier</Button>
    </div>
  );

  const Status = () => (
    <div>
      soldiers: {getUserData(user.socketId).soldiersToPlace}
    </div>
  );

  return (
    <div id="container-main">
      <div id="stage-ui">
        <Status />
        <SoldierDistUI />
      </div>

      <div id="game-container">
        <Dialog
          className="bp3-dark"
          isOpen={isStartDialogOpen}
          style={{
            padding: "20px"
          }}>
          Hello {getMyName()} <br /><br />
          {isMyturn() && !isStarted ? <Button
            onClick={startHandler}>Start Game</Button> :
            "Waiting for first user to start the game."
          }
        </Dialog>
        <Map showOceans id="map" width="150vh" height="75vh">
          {regions.map((region, i) =>
            <Region
              active={regionActive[i]}
              key={region.id}
              regionName={region.name}
              nodes={region.nodes}
              lineColor="black"
              width={2}
              soldiers={region.soldierCount}
              fillColor={continents.find(continent => continent.id == region.continentId).color}
              textColor={getUserData(region.occupiedById).color}
            />
          )}
        </Map>
        <div id="bottom">
          <MiniChat socket={socket} room={room} users={users} style={{ width: "150vh", height: "25vh" }} />
        </div>

      </div>

    </div>)
};