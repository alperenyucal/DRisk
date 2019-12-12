import React from "react";

export default ({ children, onClick }) => {

  return (
    <div
      onClick={onClick}
      style={{
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        KhtmlUserSelect: "none",
        MozUserSelect: "none",
        userSelect: "none",
        backgroundColor: "gray",
        border: "1px solid black",
        display: "flex"
      }}
    >
      {children}
    </div>
  )
}