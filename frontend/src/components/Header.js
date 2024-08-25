import React from "react";
import {
  Stack,
  AppBar,
  Toolbar,
  Typography,
  FormControlLabel,
} from "@mui/material";
import ThemeSwitch from "./ThemeSwitch";

const Header = (props) => {
  return (
    <AppBar position="sticky" sx={{ height: "100%" }}>
      <Toolbar variant="dense" sx={{ height: "100%" }}>
        <Typography variant="h3" fontWeight="bold" flex={1}>
          {props.text}
        </Typography>
        <Stack direction="row" spacing={5} alignItems="center" flex={1}>
          <Typography
            variant="h5"
            onClick={() => props.onChangeView(true)}
            sx={{
              cursor: "pointer",
              textDecoration: props.isRepairView ? "underline" : "none",
            }}
          >
            Data Repair
          </Typography>
          <Typography
            variant="h5"
            onClick={() => props.onChangeView(false)}
            sx={{
              cursor: "pointer",
              textDecoration: !props.isRepairView ? "underline" : "none",
            }}
          >
            Datalake Index
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography>Light</Typography>
          <FormControlLabel
            control={
              <ThemeSwitch
                checked={props.switch}
                onChange={(e) => props.onToggleSwitch(e.target.checked)}
              />
            }
          />
          <Typography>Dark</Typography>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
