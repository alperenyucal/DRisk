import React, { useEffect, useState } from "react";
import Map from "../components/Map";
import Region from "../components/Region";
import "./Game.css"
import { Button } from "@blueprintjs/core";


const usercolors = ["red", "blue", "yellow", "green", "black", "purple"];

export default ({ socket, map, room }) => {


  let [regions, setRegions] = useState(map.regions.map((region) => {
    return Object.assign(region, {
      soldierCount: 0,
      occupiedById: null
    })
  }))

  let [continents, setContinents] = useState(map.continents);
  let [users, setUsers] = useState(room.users);
  let [turn, setTurn] = useState(users[0]);
  let [user, setUser] = useState(null);
  let [isFinished, setIsFinished] = useState(false);
  let [isStarted, setStarted] = useState(false);

  let isMyturn = () => {
    let isIt = false;
    if (user != null)
      if (user.socketId == turn.socketId)
        isIt = true;
    return isIt;
  }

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
    let userSoldiers = totalSoldiers / 6;

    socket.emit("set users", {
      roomname: room.name,
      users:
        users.map((usr, i) => {
          return Object.assign(usr, {
            soldiersToPlace: userSoldiers,
            color: usercolors[i]
          })
        })
    })

    let regionPerUser = users.map(() => Math.floor(regions.length / users.length));
    let extraRegionCount = regions.length % users.length;

    for (let i = 0; i < extraRegionCount; i++) {
      regionPerUser[i]++;
    }
/*
    regions.map(rg => {
      let selectUser = ;

      assignRegionToUser();
    })

    let temp = [...regions];

    users.map((user, index) => {
      for (let i = 0; i < regionPerUser[index]; i++){
        let randomIndex = Math.floor((Math.random() * temp.length) + 1)
        random(temp)
        temp.pop()

      }
    })
*/

    placeSoldiersToRegion(0, user.socketId, 2);
    assignRegionToUser(0, user.socketId);

    socket.emit("set started", { roomname: room.name, isStarted: true });
  }

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
      socket.on("you are", (usr) => { setUser(usr); });

      socket.on("set regions", (rgns) => { setRegions(rgns); })
      socket.on("set started", (strd) => { setStarted(strd); })
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
    <div>
      <Map id="map" width="1200" height="600">
        {regions.map(region =>
          <Region
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
      {isMyturn() ? "It's your turn" : "Turn: " + turn.username}<br />
      {isMyturn() && !isStarted ? <Button
        onClick={startHandler}>Start Game</Button> : null}<br />

    </div>
  )
};