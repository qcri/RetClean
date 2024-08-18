import React from "react";
import {
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  FormControl,
} from "@mui/material";

const RadioButtonRegex = (props) => {
  let radioValue = Object.entries(props.options).find(
    ([_, value]) => value === true
  )[0];

  return (
    <Stack direction="column">
      <FormControl
        component="fieldset"
        disabled={props.disabledFormRadioButtons}
      >
        <RadioGroup
          row
          value={radioValue}
          onChange={(e) => props.onChangeOption(e.target.value)}
        >
          {Object.keys(props.options).map((key, index) => (
            <FormControlLabel
              key={index}
              value={key}
              control={<Radio />}
              label={key}
            />
          ))}
        </RadioGroup>
      </FormControl>
      <TextField
        fullWidth
        disabled={props.disabledTextField}
        label="Regex"
        value={props.text}
        onChange={(e) => props.onChangeText(e.target.value)}
      />
    </Stack>
  );
};

export default RadioButtonRegex;
