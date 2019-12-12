import React, { useState } from "react";
import { Navbar, Button, EditableText } from "@blueprintjs/core";
import "./MapEditor.css";
import Map from "../components/Map";
import Region from "../components/Region";
import EditorMenu from "../components/EditorMenu";
import MenuItem from "../components/MenuItem";
import MenuHeader from "../components/MenuHeader";

export default () => {

  let [regions, setRegions] = useState([]);
  let [continents, setContinents] = useState([]);
  let [selected, setSelected] = useState({});


  let continentAddClickHandler = () => {
    setContinents([...continents, {
      name: "New Continent"
    }])

  }

  let regionAddClickHandler = () => {
    setRegions([...regions, {
      name: "New Region",
      nodes: [
        {x:150,y:0},
        {x:75,y:200},
        {x:225 ,y:200},
      ]
    }])
  }


  return (
    <div id="page">

      <Navbar>
        <Navbar.Group align="left">
          <Navbar.Heading>
            <EditableText placeholder="Map Name" />
          </Navbar.Heading>
        </Navbar.Group>
      </Navbar>

      <div id="container">
        <div id="menus">
          <div style={{ flex: 2 }}>
            <EditorMenu
              name="Continents"
              clickHandler={continentAddClickHandler}>
              {continents.map((continent, index) => {
                return <MenuItem
                  key={index}
                  value={continent.name}
                  onClick={() => {
                    console.log("click " + index)
                  }} />
              })}
            </EditorMenu>

            <EditorMenu
              className="menu"
              name="Regions"
              clickHandler={regionAddClickHandler}>
              {regions.map((region, index) => {
                return <MenuItem value={region.name} />
              })}
            </EditorMenu>
          </div>
          <div style={{ flex: 1 }}>
            <MenuHeader>Properties</MenuHeader>
              <RegionForm></RegionForm>
          </div>


        </div>

        <div id="map-container">
          <Map width="1200">
            {regions.map((region) => {
              return <Region key={region.name} nodes={region.nodes} regionName={region.name} fillColor="red"></Region>
            })}
          </Map>
        </div>


      </div>
    </div>
  );
};

/*
[{
  name: "adana",
  nodes: [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 150, y: 250 },
    { x: 0, y: 100 },
  ],
},
{
  name: "mersin",
  nodes: [
    { x: 200, y: 0 },
    { x: 300, y: 0 },
    { x: 300, y: 100 },
    { x: 350, y: 350 },
    { x: 0, y: 300 },
  ]
}]*/

const RegionForm = () => {
  return (
    <form>
      name: <input></input>
      <br/>
      <br/>
      nodes: 
    </form>
  )
}