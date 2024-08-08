import React, { useState } from "react";
import { Box } from "@mui/material";

import Header from "../components/Header";
import RepairModule from "./views/dataRepair";
import IndexModule from "./views/datalakeIndex";

export const MainPage = (props) => {
  const [isRepairView, setIsRepairView] = useState(true);
  const onChangeView = (val) => setIsRepairView(val);
  return (
    <Box id="outer" display="flex" flexDirection="column" height="100vh">
      <Box id="header">
        <Header
          isRepairView={isRepairView}
          onChangeView={onChangeView}
          text={props.appname}
          switch={props.darkMode}
          onToggleSwitch={props.toggleDarkMode}
        />
      </Box>
      <Box
        id="repair-body"
        display={isRepairView ? "flex" : "none"}
        flexGrow={1}
      >
        <RepairModule />
      </Box>
      <Box
        id="index-body"
        display={!isRepairView ? "flex" : "none"}
        flexGrow={1}
      >
        <IndexModule />
      </Box>
    </Box>
  );
};
