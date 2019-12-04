import React, { useEffect } from "react";
import Map from "../components/Map";
import Region from "../components/Region";
import "./Game.css"
import io from "socket.io-client";



export default () => {
  
  const socket = io();

  socket.on("connect",()=>{console.log("connect")})



  return (
    <div>
      <Map id="map" width="1200" height="600">
        <Region fillColor="red"></Region>
      </Map>
    </div>
  )
};
