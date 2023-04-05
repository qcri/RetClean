import React from "react";
import { InputLabel, MenuItem, FormControl, Select } from "@mui/material";

const SingleSelect = (props) => {
  return (
    <FormControl fullWidth sx={{ backgroundColor: "white" }}>
      <InputLabel>{props.label}</InputLabel>
      <Select
        disabled={props.disabled}
        value={props.selection}
        label={props.label}
        onChange={(e) => props.onChange(e.target.value)}
      >
        {props.options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SingleSelect;
