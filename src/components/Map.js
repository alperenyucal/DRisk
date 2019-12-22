import React from "react";


export default ({ width, height, id, children }) => {

  return (
      <svg style={{ backgroundColor: "DarkTurquoise" }} id={id} width={width} height={height}>
        {children}
      </svg>
  )

}
