import React, { useEffect } from "react";
import Map from "../components/Map";
import Region from "../components/Region";
import "./Game.css"


export default ({ socket, map }) => {

  
  return (
    <div>
      <Map id="map" width="1200" height="600">
        {map.regions.map(region =>
          <Region key={region.id} lineColor="black" width="2" fillColor="gray" regionName={region.name} nodes={region.nodes} />)}
      </Map>
    </div>
  )
};
