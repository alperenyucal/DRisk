import React from "react";


export default ({ width, height, id, children, showOceans = false }) => {

  return (
    <svg viewBox="0 0 1200 600" style={{ backgroundColor: showOceans ? "DarkTurquoise" : "none" }} id={id} width={width} height={height}>
      {children}
    </svg>
  )

}
