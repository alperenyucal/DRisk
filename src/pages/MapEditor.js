import React from "react";
import SideBar from "../components/Map";
import { Navbar, Button, MenuItem, Menu } from "@blueprintjs/core";
import "./MapEditor.css";
import Map from "../components/Map";


export default () => {
  return (
    <div id="page">
      <Navbar>
        <Navbar.Group align="left">
          <Navbar.Heading>Blueprint</Navbar.Heading>
          <Navbar.Divider />
          <Button className="bp3-minimal" icon="home" text="Home" />
          <Button className="bp3-minimal" icon="document" text="Files" />
        </Navbar.Group>
      </Navbar>
      <div id="container">
        <Menu id="menu">
          <MenuItem text="Submenu">
            <MenuItem text="Child one" />
            <MenuItem text="Child two" />
            <MenuItem text="Child three" />
          </MenuItem>
        </Menu>
        <div id="map-container">
          <Map width="1800"></Map>
        </div>


      </div>


    </div>
  )
};
