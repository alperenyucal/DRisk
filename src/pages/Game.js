import React, { useEffect, useState } from "react";
import Map from "../components/Map";
import Region from "../components/Region";
import MiniChat from "../components/MiniChat";
import "./Game.css"
import { Button, Dialog, Card, NumericInput } from "@blueprintjs/core";


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
  let [baseSelected, setBaseSelected] = useState(false);


  // Game state
  let [continents, setContinents] = useState(map.continents);
  let [users, setUsers] = useState(room.users.map((usr, i) => Object.assign(usr, {
    color: USERCOLORS[i]
  })));
  let turnStarted = false;
  let [turn, setTurn] = useState(users[0]);

  let isMyturn = () => user.socketId == turn.socketId;
  let isMyRegion = (rgid) => regions.find(rg => rg.id == rgid).occupiedById == user.socketId;

  let [isFinished, setIsFinished] = useState(false);
  let [isDistFinished, setDistFinished] = useState(false);
  let [isStarted, setStarted] = useState(false);
  let [stage, setStage] = useState(isMyturn() ? STAGES.DISTRIBUTION : null);

  let [showAttackPlacement, setAttackPlacement] = useState(false);
  let [lost, setLost] = useState(false);

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
    let totalSoldiers = 2 * regions.length;
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
    socket.emit("message", { message: "Game has started.", room: room.name, log: true });
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
    turnStarted = false;
    socket.emit("set turn", {
      roomname: room.name,
      turn: users[(users.findIndex(usr => usr.socketId == user.socketId) + 1) % users.length]
    });
  }

  const handleRegionClick = (region) => {
    if (isMyturn()) {
      switch (stage) {
        case STAGES.DISTRIBUTION:
        case STAGES.PLACEMENT:
          if (isMyRegion(region.id))
            setTargetRegion(region.id);
          break;
        case STAGES.REPLACEMENT:
          if (isMyRegion(region.id)) {
            if (baseSelected) {
              setTargetRegion(region.id);
              setBaseSelected(false);
            }
            else {
              setBaseSelected(true);
              setBaseRegion(region.id);
            }
          }
          break;
        case STAGES.ATTACK:
          if (baseSelected) {
            if (!isMyRegion(region.id)) {
              setTargetRegion(region.id);
              setBaseSelected(false);
            }
          }
          else {
            if (isMyRegion(region.id)) {
              setBaseSelected(true);
              setBaseRegion(region.id);
            }
          }
          break;
      }
    }
  }

  // events
  socket.on("set regions", (rgns) => { setRegions(rgns) });
  socket.on("set started", (strd) => { setStarted(strd) });
  socket.on("set dist finished", (fnsd) => { setDistFinished(fnsd) });
  socket.on("set finished", (fnsd) => { setIsFinished(fnsd) });
  socket.on("set turn", (trn) => {
    if (!turnStarted) {
      setTurn(trn);
      turnStarted = true;
      if (trn.socketId == user.socketId) { // is my turn?

        if (users.length == 1) {
          setIsFinished(true);
          socket.close();
        }

        // you lost
        /*if (regions.filter(rg => rg.occupiedById == user.socketId).length == 0 && stage !== STAGES.DISTRIBUTION) {
          let temp = [...users];
          let i = temp.findIndex(usr => usr.socketId == user.socketId);
          temp.splice(i, 1);
          endTurn();
          socket.emit("set users", { roomname: room.name, users: temp });
          socket.close();
          setLost(true);
        };*/

        setStage(isDistFinished ? STAGES.PLACEMENT : STAGES.DISTRIBUTION);
        if (isDistFinished) {
          let sldrs = Math.floor(regions.filter(rg => rg.occupiedById == user.socketId).length / 3);
          if (sldrs < 3) sldrs = 3;
          let temp = [...users];
          temp.find(usr => usr.socketId == user.socketId).soldiersToPlace = sldrs;
          socket.emit("set users", { roomname: room.name, users: temp });
        }
      }
      else
        setStage(null);
    }

  });
  socket.on("set continents", (cntnts) => { setContinents(cntnts) });
  socket.on("set users", (usrs) => { setUsers(usrs) });


  const DistUI = () => (
    <div>
      <Button onClick={() => {
        if (
          isMyturn() &&
          regions.find(rg => rg.id == targetRegion).occupiedById == user.socketId
        ) {
          if (getUserData(user.socketId).soldiersToPlace > 0) {
            addRemoveFromRegion(targetRegion, 1);
            addRemoveFromReserve(user.socketId, -1);

            socket.emit("message", {
              message: user.username + " placed a soldier to " + regions.find(rg => rg.id == targetRegion).name + ".",
              room: room.name,
              log: true
            });

            let total = 0;
            users.map(usr => { total += usr.soldiersToPlace });
            if (total == 0)
              socket.emit("set dist finished", { roomname: room.name, isDistFinished: true });
            setTargetRegion(null);
          }

          endTurn();
        }
      }}>Place soldier</Button>
      {targetRegion != null ?
        <div>You are going to place a soldier to {regions.find(rg => rg.id == targetRegion).name}</div> :
        <div>no region is selected</div>}
    </div>
  )

  const PlacementUI = () => (
    <div>
      <form onSubmit={e => {
        e.preventDefault();

        let usrData = getUserData(user.socketId);
        let num = Number(e.target[0].value);
        if (
          num > 0 &&
          num <= usrData.soldiersToPlace && // to place
          isMyturn() &&
          regions.find(rg => rg.id == targetRegion).occupiedById == user.socketId
        ) {
          addRemoveFromRegion(targetRegion, num);
          addRemoveFromReserve(user.socketId, -num);
          if (usrData.soldiersToPlace == 0)
            setStage(STAGES.ATTACK);
          setTargetRegion(null);
        }
      }}>
        <NumericInput />
        <Button type="submit">Place soldier</Button>
      </form>
      <div>Placement time</div>
      {targetRegion != null ?
        <div>You are going to place a few soldiers to {regions.find(rg => rg.id == targetRegion).name}</div> :
        <div>no region is selected</div>}
    </div>
  )

  const ReplacementUI = () => (
    <div>
      <form onSubmit={e => {
        e.preventDefault();

        let num = Number(e.target[0].value);
        if (
          num > 0 &&
          num < regions.find(rg => rg.id == baseRegion).soldierCount &&
          isMyturn() &&
          regions.find(rg => rg.id == baseRegion).occupiedById == user.socketId &&
          regions.find(rg => rg.id == targetRegion).occupiedById == user.socketId
        ) {
          addRemoveFromRegion(baseRegion, -num);
          addRemoveFromRegion(targetRegion, +num);

          setBaseRegion(null);
          setBaseSelected(null);
          setTargetRegion(null);

          endTurn();
        }
      }}>
        <NumericInput />
        <Button type="submit">Replace soldier</Button>
      </form>
      <Button onClick={() => { endTurn() }}>Pass</Button>
      <div>Replacement time</div>
      {baseRegion != null ?
        <div>You are going to replace soldiers from {regions.find(rg => rg.id == baseRegion).name}</div> :
        <div>no region is selected</div>}
      {targetRegion != null ?
        <div>You are going to place soldiers to {regions.find(rg => rg.id == targetRegion).name}</div> :
        <div>no region is selected</div>}
    </div>
  )

  const AttackUI = () => {

    return (
      <div>
        {showAttackPlacement ?
          <div>
            <form onSubmit={e => {
              e.preventDefault();
              let num = Number(e.target[0].value);
              if (
                num > 0 &&
                num < regions.find(rg => rg.id == baseRegion).soldierCount &&
                isMyturn() &&
                regions.find(rg => rg.id == baseRegion).occupiedById == user.socketId &&
                regions.find(rg => rg.id == targetRegion).occupiedById == user.socketId
              ) {
                addRemoveFromRegion(baseRegion, -num);
                addRemoveFromRegion(targetRegion, num);
              }
              setAttackPlacement(false);
            }}>
              <NumericInput />
              <Button type="submit">Move</Button>
            </form>

          </div> :
          <div>
            <form onSubmit={e => {
              e.preventDefault();

              if (
                1 < regions.find(rg => rg.id == baseRegion).soldierCount &&
                isMyturn() &&
                isMyRegion(baseRegion) &&
                !isMyRegion(targetRegion) &&
                regions.find(rg => rg.id == baseRegion).neighbours.includes(targetRegion)
              ) {

                let defenceDiceCount = regions.find(rg => rg.id == targetRegion).soldierCount == 1 ? 1 : 2;
                let attackDiceCount = regions.find(rg => rg.id == baseRegion).soldierCount > 3 ? 3 :
                  regions.find(rg => rg.id == baseRegion).soldierCount - 1;

                let attackDices = ([...Array(attackDiceCount)].map(() => Math.floor(Math.random() * 6 + 1)).sort().reverse());
                let defenceDices = ([...Array(defenceDiceCount)].map(() => Math.floor(Math.random() * 6 + 1)).sort().reverse());

                // Attack logs, dice info etc.
                socket.emit("message", {
                  message: user.username + " attacked from " + regions.find(rg => rg.id == baseRegion).name +
                    " to " + regions.find(rg => rg.id == targetRegion).name + ". " +
                    "attack dices:" + attackDices.map(d => " " + d) +
                    " |" + defenceDices.map(d => " " + d) + " :defence dices",
                  room: room.name,
                  log: true
                });

                let baseloss = 0;
                let targetloss = 0;

                let arr = attackDiceCount > defenceDiceCount ? defenceDices : attackDices;
                arr.map((dice, index) => {
                  if (dice >= attackDices[index]) baseloss++;
                  else targetloss++;
                })

                addRemoveFromRegion(baseRegion, -baseloss);
                addRemoveFromRegion(targetRegion, -targetloss);

                if (regions.find(rg => rg.id == targetRegion).soldierCount == 0) { // Attack and occupy
                  assignRegionToUser(targetRegion, user.socketId);
                  setAttackPlacement(true);
                }

              }
            }}>
              <Button type="submit">Attack</Button>
            </form>
            <Button onClick={() => {
              setBaseRegion(null);
              setBaseSelected(null);
              setTargetRegion(null);
              setStage(STAGES.REPLACEMENT)
            }}>
              End Stage
            </Button>
            <div>Attack time</div>
            {baseRegion != null ?
              <div>You are going to attack from {regions.find(rg => rg.id == baseRegion).name}</div> :
              <div>no region is selected</div>}
            {targetRegion != null ?
              <div>You are going to attack to {regions.find(rg => rg.id == targetRegion).name}</div> :
              <div>no region is selected</div>}
          </div>}
      </div>
    )
  }

  const Interactions = () => {
    let interaction;
    switch (stage) {
      case STAGES.DISTRIBUTION:
        interaction = <DistUI />;
        break;
      case STAGES.PLACEMENT:
        interaction = <PlacementUI />;
        break;
      case STAGES.ATTACK:
        interaction = <AttackUI />;
        break;
      case STAGES.REPLACEMENT:
        interaction = <ReplacementUI />;
        break;
      default:
        interaction = null;
        break;
    }
    return interaction;
  }

  const Status = () => (
    <Card>
      <div>
        <div>turn: {turn.username}</div>
        {users.map(usr => (
          <div key={usr.socketId} style={{ color: usr.color }}>
            {usr.username}: {usr.soldiersToPlace} soldiers {usr.socketId == user.socketId ? "(you)" : null}
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <div id="container-main">
      <div id="stage-ui">
        <Status />
        <Interactions />
      </div>

      <div id="game-container">
        <Dialog
          className="bp3-dark"
          isOpen={!isStarted}
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
        <Dialog
          className="bp3-dark"
          isOpen={isFinished}
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column"
          }}>
          <h4>You won {user.username}</h4>
        </Dialog>
        <Dialog
          className="bp3-dark"
          isOpen={lost}
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column"
          }}>
          <h4>You lost</h4>
        </Dialog>
        <Map showOceans id="map" width="150vh" height="75vh">
          {regions.map((region, i) =>
            <Region
              onClick={() => handleRegionClick(region)}
              active={true}
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