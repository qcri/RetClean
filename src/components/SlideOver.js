import React from "react";
import {
  Box,
  Stack,
  Drawer,
  Divider,
  Paper,
  Radio,
  RadioGroup,
  Checkbox,
  FormGroup,
  FormControl,
  FormControlLabel,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const TemporaryDrawer = (props) => {
  const Item = styled(Paper)(({ theme }) => ({
    textAlign: "center",
    color: theme.palette.text.secondary,
    height: 60,
    lineHeight: "60px",
  }));

  return (
    <div>
      <Drawer
        anchor={"left"}
        open={props.show}
        onClose={props.toggleDrawer(false)}
      >
        <Box sx={{ width: 400 }} role="presentation">
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem />}
          >
            <Box sx={{ width: 200 }}>
              <Item elevation={0}>Target Column</Item>
              <FormControl sx={{ padding: "0px 15px" }}>
                <RadioGroup
                  value={props.target}
                  onChange={(e) => props.selectTarget(parseInt(e.target.value))}
                >
                  {props.columns.map((col, index) => (
                    <FormControlLabel
                      value={index}
                      control={<Radio />}
                      label={col.title}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>

            <Box sx={{ width: 200 }}>
              <Item elevation={0}>Pivot Columns</Item>
              <FormControl sx={{ padding: "0px 15px" }}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={props.pivots.every((v) => v === true)}
                        onChange={(e) => {
                          let newPivots = [...props.pivots].map(
                            (x) => e.target.checked
                          );
                          props.selectPivots(newPivots);
                        }}
                      />
                    }
                    label={"All"}
                  />
                  {props.columns.map((col, index) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={props.pivots[index]}
                          onChange={(e) => {
                            let newPivots = [...props.pivots];
                            newPivots[index] = e.target.checked;
                            props.selectPivots(newPivots);
                          }}
                        />
                      }
                      label={col.title}
                    />
                  ))}
                </FormGroup>
              </FormControl>
            </Box>
          </Stack>
        </Box>
      </Drawer>
    </div>
  );
};

export default TemporaryDrawer;
