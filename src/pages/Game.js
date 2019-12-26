import React, { useEffect, useState } from "react";
import Map from "../components/Map";
import Region from "../components/Region";
import MiniChat from "../components/MiniChat";
import "./Game.css"
import { Button, Dialog, Card, Colors } from "@blueprintjs/core";


const USERCOLORS = ["red", "blue", "yellow", "green", "orange", "purple"];

const STAGES = {
  DISTRIBUTION: "DISTRIBUTION",
  PLACEMENT: "PLACEMENT",
  ATTACK: "ATTACK",
  REPLACEMENT: "REPLACEMENT"
}

export default ({ user, room, map, socket }) => {


  // Region stuff
  let [regions, setRegions] = useState(map.regions.map(region => Object.assign(region, {
    soldierCount: 0,
    occupiedById: null
  })));
  let [baseRegion, setBaseRegion] = useState(null); // region id
  let [targetRegion, setTargetRegion] = useState(null);


  // Game state
  let [continents, setContinents] = useState(map.continents);
  let [users, setUsers] = useState(room.users.map((usr, i) => Object.assign(usr, {
    color: USERCOLORS[i]
  })));
  let [turn, setTurn] = useState(users[0]);
  let [isFinished, setIsFinished] = useState(false);
  let [isStarted, setStarted] = useState(false);
  let [stage, setStage] = useState(STAGES.DISTRIBUTION);


  // UI state
  let [isStartDialogOpen, setStartIsOpen] = useState(true);
  let [regionActive, setRegionActive] = useState(map.regions.map(() => false));


  const isMyturn = () => user.socketId == turn.socketId;
  const isMyRegion = (rgid) => regions.find(rg => rg.id == rgid).occupiedById == user.socketId;

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
        soldiersToPlace: userSoldiers
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
        addRemoveFromRegion(reg.id, 1);
        addRemoveFromReserve(user.socketId, -1);
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

  const addRemoveFromRegion = (rgn, sldrs) => {
    let temp = [...regions];
    temp.find(rg => rg.id == rgn).soldierCount += sldrs;
    socket.emit("set regions", { roomname: room.name, regions: temp });
  };

  const addRemoveFromReserve = (sckt, sldrs) => {
    let temp = [...users];
    temp.find(usr => usr.socketId == sckt).soldiersToPlace += sldrs;
    socket.emit("set users", { roomname: room.name, users: temp });
  }

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

  let handleRegionClick = (region) => {
    if (isMyturn()) {
      switch (stage) {
        case STAGES.DISTRIBUTION:
          if (isMyRegion(region.id))
            setTargetRegion(region.id);
          break;
      }
    }
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
      socket.on("set turn", (trn) => {
        setTurn(trn);
      })
      socket.on("set continents", (cntnts) => { setContinents(cntnts); })
      socket.on("set users", (usrs) => { setUsers(usrs); })

    }
    catch (error) {
      console.error(error);
    }

  })

  const DistUI = () => (
    <div>
      <Button onClick={() => {
        if (
          isMyturn() &&
          users.find(usr => usr.socketId == user.socketId).soldiersToPlace > 0 &&
          regions.find(rg => rg.id == targetRegion).occupiedById == user.socketId
        ) {
          addRemoveFromRegion(targetRegion, 1);
          addRemoveFromReserve(user.socketId, -1);
          endTurn();
        }
      }}>Place soldier</Button>
      {targetRegion != null ?
        <div>You are going to place a soldier to {regions.find(rg => rg.id == targetRegion).name}</div> :
        <div>no region is selected</div>}
    </div>
  )

  const Interactions = () => {
    let interaction;
    switch (stage) {
      case STAGES.DISTRIBUTION:
        interaction = <DistUI />;
        break;
      case STAGES.PLACEMENT:
      case STAGES.ATTACK:
      case STAGES.REPLACEMENT:
        break;
    }
    return interaction;
  }

  const Status = () => (
    <Card>
      <div>
        {users.map(usr => <div style={{ color: usr.color }}>
          {usr.username}: {usr.soldiersToPlace} soldiers {usr.socketId == user.socketId ? "(you)" : null}</div>)}
      </div>
    </Card>
  );

  return (
    <div id="container-main">
      <div id="stage-ui">
        <Status />
        {isMyturn() ? <Interactions /> : null}
      </div>

      <div id="game-container">
        <Dialog
          className="bp3-dark"
          isOpen={isStartDialogOpen}
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column"
          }}>
          <h4>Hello {user.username}</h4>
          {isMyturn() && !isStarted ? <Button
            onClick={startHandler}>Start Game</Button> :
            <div>Waiting for first user to start the game.</div>
          }
        </Dialog>
        <Map showOceans id="map" width="150vh" height="75vh">
          {regions.map((region, i) =>
            <Region
              onClick={() => handleRegionClick(region)}
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