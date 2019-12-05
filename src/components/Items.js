import React, { useState } from "react";
import { Button, Collapse } from "@blueprintjs/core";

export default ({ children, clickHandler, name }) => {

  const [isOpen,setOpen] = useState(true);

  return (
    <div>
      <Button
        onClick={() => setOpen(isOpen ? false : true)}
        fill>{name}</Button>
      <Collapse isOpen={isOpen}>
        {children}
        <Button onClick={clickHandler}
          small>  + Add </Button>
      </Collapse>
    </div>
  )
}