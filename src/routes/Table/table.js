import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "@mui/material";
import { dataToTable, getKCandidates } from "../../services/table";

import Directions from "../../components/Directions";
import Table from "../../components/Table";
import Drawer from "../../components/SlideOver";

export const TablePage = () => {
  const loadedDataState = useSelector((state) => state.data.value);
  const pageDirections =
    "Choose a target column for imputation. You can specify exactly which columns to use for imputation as well as the number of candate values.";
  const [dataState, updateDataState] = useState({
    filename: loadedDataState.filename,
    dataObject: loadedDataState.dataObject,
    ...dataToTable(loadedDataState.dataObject),
    prevDataObject: {},
    kHeaders: [],
  });

  const [anchorState, updateAnchorState] = useState({
    disable: false,
    anchor: false,
    prevIndex: 0,
    targetIndex: 0,
    selectedPivots: [
      ...Array(Object.keys(loadedDataState.dataObject).length),
    ].map((x) => false),
    kCandidates: 1,
  });

  // useEffect(() => {
  //   console.log("yeee");
  //   let columns = JSON.parse(JSON.stringify(dataState.columns));
  //   let prevTarget = columns[anchorState.prevIndex];
  //   delete prevTarget["headerStyle"];
  //   columns = { ...prevTarget };
  //   columns[anchorState.targetIndex] = {
  //     ...columns[anchorState.targetIndex],
  //     headerStyle: {
  //       backgroundColor: "#ffeb3b",
  //       color: "#FFF",
  //     },
  //   };
  //   updateDataState({
  //     ...dataState,
  //     columns: dataState.columns,
  //   });
  //   updateAnchorState({
  //     ...anchorState,
  //     prevIndex: anchorState.targetIndex,
  //   });
  // }, [anchorState.targetIndex]);

  const onCellClick = (event, rowData) => {
    const rowIndex = rowData["MUI_ID"];
    const colIndex = event.target["cellIndex"];
    const value = event.target.getAttribute("value");
    if (
      anchorState.selectedPivots.length <= colIndex &&
      colIndex < anchorState.selectedPivots.length + dataState.kHeaders.length
    ) {
      event.target["bgColor"] = "#ffeb3b";
      console.log(`row:${rowIndex}, columns: ${colIndex}, value: ${value}`);
    }
  };

  const updateTargetCell = (row, col, value) => {};

  const onSelectTarget = (target) => {
    let columns = JSON.parse(JSON.stringify(dataState.columns));
    let prevTarget = columns[anchorState.targetIndex];
    delete prevTarget["headerStyle"];

    columns[target] = {
      ...columns[target],
      headerStyle: {
        backgroundColor: "#ffeb3b",
        color: "#FFF",
      },
    };
    updateDataState({
      ...dataState,
      columns: [...columns],
    });
    updateAnchorState({
      ...anchorState,
      targetIndex: target,
    });
  };

  const onSelectPivots = (pivots) =>
    updateAnchorState({ ...anchorState, selectedPivots: pivots });

  const onToggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    )
      return;
    updateAnchorState({ ...anchorState, anchor: open });
  };

  // const callImpute = async () => {
  //   let tableData = JSON.parse(JSON.stringify(dataState.dataObject));
  //   for (let i = 0; i < anchorState.selectedPivots.length; i++) {
  //     if (!anchorState.selectedPivots[i]) {
  //       const header = dataState.columns[i].title;
  //       delete tableData[header];
  //     }
  //   }
  //   const targetName = dataState.columns[anchorState.targetIndex].title;
  //   const pivotNames = Object.keys(tableData).join("||");
  //   const k = anchorState.kCandidates;
  //   const useFixed = true;
  //   const givenFixed = null;
  //   const languageModel = "gpt3";

  //   let resp = await getKCandidates(
  //     tableData,
  //     targetName,
  //     pivotNames,
  //     k,
  //     useFixed,
  //     givenFixed,
  //     languageModel
  //   );
  // };

  const onCallImpute = async () => {
    // let tableData = JSON.parse(JSON.stringify(dataState.dataObject));
    // for (let i = 0; i < anchorState.selectedPivots.length; i++) {
    //   if (!anchorState.selectedPivots[i]) {
    //     const header = dataState.columns[i].title;
    //     delete tableData[header];
    //   }
    // }
    // const targetName = dataState.columns[anchorState.targetIndex].title;
    // const pivotNames = Object.keys(tableData).join("||");
    // const k = anchorState.kCandidates;
    // const useFixed = true;
    // const givenFixed = null;
    // const languageModel = "gpt3";

    updateDataState({
      ...dataState,
      prevDataObject: JSON.parse(JSON.stringify(dataState.dataObject)),
    });
    let kDataArr = await getKCandidates();
    let kHeaders = [];
    let kDataObject = {};
    for (let i = 0; i < kDataArr.length; i++) {
      let header = Object.keys(kDataArr[i])[0];
      kHeaders.push(header);
      kDataObject[header] = kDataArr[i][header];
    }
    updateDataState({ ...dataState, kHeaders: kHeaders });
    updateAnchorState({ ...anchorState, disable: true });
    onChangeDataState(dataState.dataObject, kDataObject);
  };

  const onChangeDataState = (oldData, newData) => {
    let newDataObject = { ...oldData, ...newData };
    updateDataState((prevState) => {
      return {
        ...prevState,
        dataObject: newDataObject,
        ...dataToTable(newDataObject),
      };
    });
  };

  return (
    <div>
      <Directions text={pageDirections} />
      <Drawer
        columns={dataState.columns}
        target={anchorState.targetIndex}
        pivots={anchorState.selectedPivots}
        show={anchorState.anchor}
        selectTarget={onSelectTarget}
        selectPivots={onSelectPivots}
        toggleDrawer={onToggleDrawer}
      ></Drawer>
      <Table
        filename={dataState.filename}
        columns={dataState.columns}
        data={dataState.data}
        disableDrawerButton={anchorState.disable}
        callImpute={onCallImpute}
        cellClick={onCellClick}
        toggleDrawer={onToggleDrawer}
      ></Table>
    </div>
  );
};
