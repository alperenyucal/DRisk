import React, { useEffect, useState } from "react";
import Map from "../components/Map";
import Region from "../components/Region";
import "./Game.css"


export default ({ socket, map }) => {

  let [regions, setRegions] = useState(map.regions);
  let [continents, setContinents] = useState(map.continents);
  let [users, setUsers] = useState();
  let [turn, setTurn] = useState();
  let [user, setUser] = useState();
  let [isFinished, setIsFinished] = useState();
  let [isStarted, setStarted] = useState();

  return (
    <div>
      <Map id="map" width="1200" height="600">
        {map.regions.map(region =>
          <Region key={region.id} lineColor="black" width="2" fillColor="gray" regionName={region.name} nodes={region.nodes} />)}
      </Map>
    </div>
  )
};
