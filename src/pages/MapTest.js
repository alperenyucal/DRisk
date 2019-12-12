import React from "react";
import Map from "../components/Map"
import Region from "../components/Region"

let regions = "";

export default ()=>{
  return (
    <Map width="1200" height="600">
      {
        regions.map((region)=>
        {
          return <Region key={region.id} lineColor="black" width="2" fillColor="gray" regionName={region.name} nodes={region.nodes} />
        }
        )
      }

    </Map>
  )
}