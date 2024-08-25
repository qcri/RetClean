import React, { useState } from "react";
import { Box } from "@mui/material";

import Header from "../components/Header";
import RepairModule from "./views/dataRepair";
import IndexModule from "./views/datalakeIndex";

export const MainPage = (props) => {
  const [isRepairView, setIsRepairView] = useState(true);
  const onChangeView = (val) => setIsRepairView(val);
  const [indexList, setIndexList] = useState([]);

  return (
    <Box
      id="outer"
      display="flex"
      flexDirection="column"
      height="100vh"
      width="100vw"
    >
      <Box id="header" height="6%">
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
        height="94%"
        display={isRepairView ? "flex" : "none"}
      >
        <RepairModule
          searchIndexList={indexList}
          setSearchIndexList={setIndexList}
        />
      </Box>
      <Box
        id="index-body"
        height="94%"
        display={!isRepairView ? "flex" : "none"}
      >
        <IndexModule
          searchIndexList={indexList}
          setSearchIndexList={setIndexList}
        />
      </Box>
    </Box>
  );
};
