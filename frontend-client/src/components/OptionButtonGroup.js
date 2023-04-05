import React from "react";
import { Button, ButtonGroup } from "@mui/material";

const OptionButtonGroup = (props) => {
  return (
    <ButtonGroup
      disabled={props.disabled}
      fullWidth
      size="large"
      variant="outlined"
      aria-label="outlined button group"
      sx={{ backgroundColor: "white", height: 50 }}
    >
      {Object.keys(props.options).map((key, index) => (
        <Button
          disableElevation
          key={key}
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
