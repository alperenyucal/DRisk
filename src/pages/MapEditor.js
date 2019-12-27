import React, { useState } from "react";
import { Navbar, Button, EditableText, InputGroup } from "@blueprintjs/core";
import "./MapEditor.css";
import Map from "../components/Map";
import Region from "../components/Region";
import EditorMenu from "../components/EditorMenu";
import MenuItem from "../components/MenuItem";
import MenuHeader from "../components/MenuHeader";

export default () => {

  let [regions, setRegions] = useState([]);
  let [continents, setContinents] = useState([]);
  let [selectedRegion, setSelectedRegion] = useState({});

  let getSelectedRegionData = () => {
    return regions.find(rg => rg.id == selectedRegion) || {
      id: null,
      name: null,
      nodes: [],
      neighbours: [],
      continent: null
    }
  }


  let continentAddClickHandler = () => {
    setContinents([...continents, {
      name: "New Continent"
    }])

  }

  let regionAddClickHandler = () => {

    let id;
    let ids = regions.map(rg => rg.id)

    for (let i = 0; i < 100; i++) {
      if (!ids.includes(i)) {
        id = i;
      }
    }

    setRegions([...regions, {
      id: id,
      name: "New Region",
      nodes: [
        { x: 150, y: 0 },
        { x: 75, y: 200 },
        { x: 225, y: 200 },
      ]
    }])
    setSelectedRegion(id);
  }


  let NodeForm = ({ node, onClick }) => {
    return (
      <div style={{ display: "flex" }}>
        <form onSubmit={e => {
          e.preventDefault();
          let temp = [...regions];
          let nd = temp.find(r => r.id == selectedRegion).nodes.find(n => n.x == node.x && n.y == node.y);
          nd.x = Number(e.target[0].value);
          nd.y = Number(e.target[1].value);
          setRegions(temp);
        }}>
          x:<InputGroup small defaultValue={node.x} />
          y:<InputGroup small defaultValue={node.y} />
          <button type="submit" style={{ float: "right", color: "red" }}>✅</button>
          <div onClick={onClick} style={{ float: "right", color: "red" }}>❌</div>
        </form>
      </div>
    )
  }

  const RegionForm = () => {
    return (
      <div>
        <form onSubmit={e => {
          let temp = [...regions];
          temp.find(r => r.id == selectedRegion).name = e.target[0].value;
          setRegions([...regions])
        }}>
          name: <InputGroup
            defaultValue={getSelectedRegionData().name} />
          <br />

          <Button type="submit">Submit Name</Button>
        </form>
        nodes:
        {getSelectedRegionData().nodes.map((nd, i) => <NodeForm onClick={() => {
          let temp = [...regions];
          temp.find(r => r.id == selectedRegion).nodes.splice(i, 1);
          setRegions([...regions])
        }} node={nd} key={i} />)}
        <br />
      </div>
    )
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
                return <MenuItem key={region.id} value={region.name} onClick={() => {
                  setSelectedRegion(region.id);
                }} />
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
              return <Region key={region.id} nodes={region.nodes} regionName={region.name} fillColor="red"></Region>
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

