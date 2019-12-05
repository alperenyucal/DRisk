import React, { useState } from "react";
import SideBar from "../components/Map";
import { Navbar, Button, MenuItem, Menu, EditableText, Dialog, FormGroup, InputGroup, Divider, Callout } from "@blueprintjs/core";
import "./MapEditor.css";
import Map from "../components/Map";
import Region from "../components/Region";
import Items from "../components/Items";

export default () => {

  let [newRegionIsOpen, setNewRegionOpen] = useState(false);


  let [regions, setRegions] = useState(
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
    }]);




  let continentClickHandler = () => {
    let temp = newRegionIsOpen ? false : true;
    setNewRegionOpen(temp)
  }


  return (
    <div id="page">
      <Navbar>
        <Navbar.Group align="left">
          <EditableText placeholder="Map Name"></EditableText>
          <Navbar.Divider />
          <Button minimal icon="home" text="Home" />
          <Button minimal icon="document" text="Files" />
        </Navbar.Group>
      </Navbar>
      <div id="container">
        <Menu id="menu">
          {/*<Button
            onClick={() => setContientOpen(isContinentOpen ? false : true)}
            fill>Continents</Button>
          <Collapse isOpen={isContinentOpen}>
            <Button onClick={() => setNewRegionOpen(true)}
              small={true}>  + Add </Button>
            <Dialog id="dialog" isOpen={newRegionIsOpen} >
              <p id="title">Name:</p>
              <InputGroup fill={false} placeHolder="Name"></InputGroup>
              <p id="title">Add node:</p>
              <InputGroup fill={false} placeHolder="X"></InputGroup>
              <InputGroup fill={false} placeHolder="Y"></InputGroup>
              <Button id="submitButton"
                onClick={() => {
                  setNewRegionOpen(false);

                }}
                isCloseButtonShown={true}
                canEscapeKeyClose={true}
                fill={false}> Submit </Button>
            </Dialog>



          </Collapse>

          <Divider />

          <Button
            onClick={() => setRegionOpen(isRegionOpen ? false : true)}
            fill>Region</Button>
          <Collapse isOpen={isRegionOpen}>
            <Button small={true}>  + Add </Button>
          </Collapse>*/}

          <Items
            name="Continents"
            clickHandler={continentClickHandler}>
            <div>zaaa</div>
            <div>zaaa</div>
            <div>zaaa</div>
          </Items>
          <Dialog id="dialog" isOpen={newRegionIsOpen} >
            <form onSubmit={(e) => {
              e.preventDefault();
              for(let t of e.target){}
              console.log(e.target[1].value);
            }}>
              <p id="title">Name:</p>
              <InputGroup fill={false} placeHolder="Name"></InputGroup>
              <p id="title">Add node:</p>
              <InputGroup id="input" fill={false} placeHolder="X" onChange={() => {
                let x = document.getElementById("input");
                alert(x.value);
              }}></InputGroup>
              <InputGroup fill={false} placeHolder="Y"></InputGroup>
              <Button id="submitButton"
                type="submit"
                
                isCloseButtonShown={true}
                canEscapeKeyClose={true}
                fill={false}> Submit </Button>
            </form>


          </Dialog>
          <Divider />
          <Items name="Regions" items={[]}></Items>

          {/*<Callout id="properties">
            <Collapse isOpen={true}>
              <p id="title">Name:</p>
              <ControlGroup fill={true} vertical={false}>
                <InputGroup fill={false} placeHolder="Name"></InputGroup>
              </ControlGroup>
            </Collapse>
          </Callout>*/}
        </Menu>

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
