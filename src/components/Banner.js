import React from "react";

const Banner = () => {
  return (
    <div>
      <h1
        style={{
          margin: 0,
          padding: 0,
          fontSize: "6rem",
          fontWeight: "600",
          lineHeight: "1em",
          color: "gray",
          textAlign: "center",
        }}
      >
        AID
      </h1>
      <h3
        style={{
          fontSize: "1rem",
          fontWeight: "200",
          marginBottom: "2rem",
          lineHeight: "1em",
          color: "black",
          textAlign: "center",
        }}
      >
        AI for Data Preparation.
      </h3>
    </div>
  );
};

export default Banner;
