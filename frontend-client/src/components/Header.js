import React from "react";
import { Box } from "@mui/material";

const Header = (props) => {
  return (
    <Box
      sx={{
        typography: "h1",
        color: "black",
        textAlign: "left",
        fontFamily: "League Spartan",
        fontSize: "3rem",
        fontWeight: "bold",
      }}
    >
      {props.text}
    </Box>
  );
};

export default Header;
