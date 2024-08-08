import React from "react";
import { Button, ButtonGroup } from "@mui/material";

const OptionButtonGroup = (props) => {
  return (
    <ButtonGroup
      fullWidth
      disabled={props.disabled}
      size="large"
      variant="outlined"
      aria-label="outlined button group"
      sx={{ bgColor: "white", height: 50 }}
    >
      {Object.keys(props.options).map((key, index) => (
        <Button
          disableElevation
          key={index}
          variant={props.options[key] ? "contained" : "outlined"}
          onClick={(e) => props.onClick(e.target.textContent)}
        >
          {key}
        </Button>
      ))}
    </ButtonGroup>
  );
};

export default OptionButtonGroup;
