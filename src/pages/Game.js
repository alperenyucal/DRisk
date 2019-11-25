import React from "react";
import Map from "../components/Map";
import Region from "../components/Region";
import "./Game.css"

export default () => {
  return (
    <div>
      <Map id="map" width="1200" height="600">
        <Region></Region>
      </Map>
    </div>
  )
};
