import React from "react";
import { Button, ButtonGroup, useTheme } from "@mui/material";

const OptionButtonGroup = (props) => {
  const theme = useTheme();
  const backgroundColor = theme.palette.custom.button.background;
  return (
    <ButtonGroup
      fullWidth
      disabled={props.disabled}
      variant="outlined"
      aria-label="outlined button group"
      sx={{ bgcolor: backgroundColor, height: 50 }}
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
