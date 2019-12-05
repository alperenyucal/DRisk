import React from "react";

// Nodes is a list of nodes of the region
export default ({ nodes, lineColor, width, fillColor, soldiers, regionName }) => {
  
  let path = "M";
  let i = 1;
  for (let node of nodes) {
    path += node["x"];
    path += " ";
    path += node["y"];
    if (nodes.length == i) path += " ";
    else {
      path += " L";
    }
    i++;
  }
  path += " Z";

  let sum_x = 0;
  let sum_y = 0;
  for (let n of nodes) {
    sum_x += n.x;
    sum_y += n.y;
  }
  let middle_x = sum_x / nodes.length;
  let middle_y = sum_y / nodes.length;

  return (
    <g>
      <path d={path} stroke={lineColor} strokeWidth={width} fill={fillColor}></path>
        <text x={middle_x}  y={middle_y - 15} textAnchor="middle" style={{ font: "bold 30px sans-serif" }}>
          {regionName}
        </text>
        <text x={middle_x} y={middle_y + 15} textAnchor="middle" style={{ font: "bold 30px sans-serif" }}>
          {soldiers}
        </text>      
    </g>
  );
};
