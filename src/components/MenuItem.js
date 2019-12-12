import React, { useState } from "react";

export default ({ value , onClick}) => {

  return (
    <div onClick={onClick}>
      {value}
    </div>
  )
}