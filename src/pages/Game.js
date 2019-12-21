import React, { useEffect } from "react";
import Map from "../components/Map";
import Region from "../components/Region";
import "./Game.css"


export default () => {



  let list = [{ x: 150, y: 0 }, { x: 75, y: 100 }, { x: 225, y: 100 }]
  return (
    <div>
      <Map id="map" width="1200" height="600">
        <Region nodes={list} fillColor="red" regionName="trolololo" lineColor="black" soldiers={2} width={3}></Region>
      </Map>
    </div>
  )
};
