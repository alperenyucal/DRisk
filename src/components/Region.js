import React from "react";
import "./Region.css"

// Nodes is a list of nodes of the region
export default ({ nodes, lineColor, width, fillColor, soldiers, regionName, textColor, active, selected }) => {

  let path;
  let middle_x = 0;
  let middle_y = 0;

  if (typeof (nodes) != "string") {
    path = "M";
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
    middle_x = sum_x / nodes.length;
    middle_y = sum_y / nodes.length;

  }
  else {path = nodes};

  let className = active ? "active" : "passive";
  className = selected ? "selected" : className;

  return (
    <g className={className}>
      <path d={path} stroke={lineColor} strokeWidth={width} fill={fillColor}></path>
      <text x={middle_x} y={middle_y - 10} textAnchor="middle" style={{ userSelect: "none", font: "bold 15px sans-serif" }}>
        {regionName}
      </text>
      <text x={middle_x} y={middle_y + 20} stroke="black" strokeWidth={1} fill={textColor} textAnchor="middle" style={{ userSelect: "none", font: "bold 25px sans-serif" }}>
        {soldiers == 0 ? null : soldiers}
      </text>
    </g>
  );
};
