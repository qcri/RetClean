import React from "react";

const Directions = (props) => {
  return (
    <div>
      <h1
        style={{
          fontSize: "1.25rem",
          fontWeight: "200",
          margin: "2rem",
          lineHeight: "1.25em",
          color: "black",
          textAlign: "center",
        }}
      >
        {props.text}
      </h1>
    </div>
  );
};

export default Directions;
