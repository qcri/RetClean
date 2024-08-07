import React from "react";
import {
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  ListSubheader,
} from "@mui/material";

const CustomSelect = (props) => {
  return (
    <FormControl fullWidth sx={{ bgcolor: "white" }}>
      <InputLabel>{props.label}</InputLabel>
      <Select
        disabled={props.disabled}
        label={props.label}
        value={props.selection}
        multiple={props.multiple}
        onChange={(e) => props.onChange(e.target.value)}
        renderValue={(selected) =>
          props.multiple ? selected.join(", ") : selected
        }
      >
        {props.groupedOptions.flatMap((group, groupIndex) => [
          props.includeGroupNames && (
            <ListSubheader key={`header-${groupIndex}`}>
              {group.name}
            </ListSubheader>
          ),
          ...group.options.map((option, optionIndex) => (
            <MenuItem key={`${groupIndex}-${optionIndex}`} value={option}>
              {option}
            </MenuItem>
          )),
        ])}
      </Select>
    </FormControl>
  );
};

export default CustomSelect;
