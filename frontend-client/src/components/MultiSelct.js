import React from "react";
import {
  OutlinedInput,
  InputLabel,
  MenuItem,
  FormControl,
  ListItemText,
  Select,
  Checkbox,
} from "@mui/material/";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const MultipleSelectCheckmarks = (props) => {
  return (
    <FormControl fullWidth sx={{ backgroundColor: "white" }}>
      <InputLabel>{props.label}</InputLabel>
      <Select
        disabled={props.disabled}
        multiple
        value={props.selection}
        input={<OutlinedInput label={props.label} />}
        onChange={(e) => props.onChange(e.target.value)}
        renderValue={(selected) => selected.join(", ")}
        MenuProps={MenuProps}
      >
        {props.options.map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox checked={props.selection.indexOf(option) > -1} />
            <ListItemText primary={option} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default MultipleSelectCheckmarks;
