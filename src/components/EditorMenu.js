import React, { useState } from "react";
import { Collapse, Button } from "@blueprintjs/core";
import MenuHeader from "./MenuHeader";


export default ({ children, clickHandler, name }) => {

  const [isOpen, setOpen] = useState(true);

  return (
    <div>
      <MenuHeader
        onClick={() => setOpen(isOpen ? false : true)}
      >
        <div style={{ flex: "1" }}>{name}</div>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            clickHandler();
          }}
          small
          style={{
            marginRight: "0px",
          }}>  + Add </Button>
      </MenuHeader>
      <Collapse isOpen={isOpen}>
        {children}
      </Collapse>

    </div>
  )
}