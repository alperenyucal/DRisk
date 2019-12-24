import React, { useEffect, useState } from "react";
import Map from "../components/Map";
import Region from "../components/Region";
import MiniChat from "../components/MiniChat";
import "./Game.css"
import { Button, Dialog } from "@blueprintjs/core";


const usercolors = ["red", "blue", "yellow", "green", "black", "purple"];

export default ({ socket, map, room }) => {

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
  let [user, setUser] = useState(null);
  let [isFinished, setIsFinished] = useState(false);
  let [isStarted, setStarted] = useState(false);
  let [stage, setStage] = useState("soldierDist"); // ["soldierDist", "placement", "attack", "replacement"]

  // UI state
  let [isStartDialogOpen, setStartIsOpen] = useState(true);
  let [regionActive, setRegionActive] = useState(map.regions.map(() => true));


  let isMyturn = () => {
    let isIt = false;
    if (user != null)
      if (user.socketId == turn.socketId)
        isIt = true;
    return isIt;
  }

  let getMyName = () => user == null ? null : user.username;


  let getUserColor = (sckt) => {
    let u = users.find(usr => usr.socketId == sckt);
    if (u != undefined)
      if (u.hasOwnProperty("color"))
        return u.color;
    return "gray";
  };

  let startHandler = () => {
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

  let startSoldierDist = () => {
    setRegionActive(regions.map(rg => rg.occupiedById == user.socketId));
  };

  let placeSoldiersToRegion = (rgn, sckt, sldrs) => {
    let temp = [...users];
    temp.find(usr => usr.socketId == sckt).soldiersToPlace -= sldrs;
    socket.emit("set users", { roomname: room.name, users: temp });
    temp = [...regions];
    temp.find(rg => rg.id == rgn).soldierCount += sldrs;
    socket.emit("set regions", { roomname: room.name, regions: temp });
  };

  let assignRegionToUser = (rgn, sckt) => {
    let temp = [...regions];
    temp.find(rg => rg.id == rgn).occupiedById = sckt;
    socket.emit("set regions", { roomname: room.name, regions: temp });
  }

  useEffect(() => {
    socket.emit("who am i");

    try {
      // events
      socket.on("you are", (usr) => { setUser(usr); });
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
    return () => {
    };
  })


  return (
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
            textColor={getUserColor(region.occupiedById)}
          />
        )}
      </Map>
      <div id="bottom">
        <MiniChat socket={socket} room={room} users={users} style={{ width: "150vh", height: "25vh" }} />
      </div>
    </div>)
};