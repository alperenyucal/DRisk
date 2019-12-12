import React, { useEffect, useState } from "react";
import Map from "../components/Map"
import Region from "../components/Region"


export default () => {

  let [regions, setRegions] = useState([]);

  useEffect(() => {
    fetch("/static/map.json")
      .then(res => res.json())
      .then(data => {
        let temp = data.regions.map((region) => {
          return {
            id: region.id,
            name: region.name,
            nodes: region.nodes.map((node) => { return { x: (node.x * 40), y: (node.y * 30) } })
          }
        })


        setRegions(temp);
      })
  })

  return (
    <Map width="1200" height="600">
      {
        regions.map((region) => {
          return <Region key={region.id} lineColor="black" width="2" fillColor="gray" regionName={region.name} nodes={region.nodes} />
        }
        )
      }

    </Map>
  )
}