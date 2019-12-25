import React, { useEffect, useState } from "react";
import Map from "../components/Map"
import Region from "../components/Region"


export default () => {

  let [regions, setRegions] = useState([]);

  useEffect(() => {
    fetch("/static/map.json")
      .then(res => res.json())
      .then(data => {
        setRegions(data.regions);
      })
  })

  return (
    <Map width="1200" height="600">{
      regions.map((region, index) => {
        return <Region
          key={region.id}
          lineColor="black"
          width="2"
          fillColor={index == 0 || index == 1 || index == 2 ? "blue" : "gray"}
          active={true}//index == 0 ? true : false}
          selected={index == 2 ? true : false}
          regionName={region.name}
          nodes={region.nodes} />
      })
    }
    </Map>
  )
}