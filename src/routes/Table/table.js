import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  dataToTable,
  getKCandidates,
  getKCandidatesTest,
} from "../../services/table";

import Directions from "../../components/Directions";
import Table from "../../components/Table";
import Drawer from "../../components/SlideOver";

export const TablePage = () => {
  const loadedDataState = useSelector((state) => state.data.value);
  const numCols = Object.keys(loadedDataState.dataObject).length;
  const pageDirections =
    "Choose a target column for imputation. You can specify exactly which columns to use for imputation as well as the number of candate values.";
  const [dataState, updateDataState] = useState({
    filename: loadedDataState.filename,
    dataObject: loadedDataState.dataObject,
    ...dataToTable(loadedDataState.dataObject),
    kHeaders: [],
    chosenValues: [],
  });
  const [anchorState, updateAnchorState] = useState({
    disable: false,
    anchor: false,
    prevIndex: 0,
    targetIndex: numCols - 1,
    selectedPivots: [...Array(numCols)].map((x) => false),
    kCandidates: 3,
  });

  useEffect(() => {
    let columns = [...dataState.columns];
    delete columns[anchorState.prevIndex]["headerStyle"];
    columns[anchorState.targetIndex]["headerStyle"] = {
      backgroundColor: "#f50057",
      color: "#FFF",
    };

    updateDataState({
      ...dataState,
      columns: columns,
    });
    updateAnchorState({
      ...anchorState,
      prevIndex: anchorState.targetIndex,
    });
  }, [anchorState.targetIndex, dataState.kHeaders]);

  const onCellClick = (event, rowData) => {
    const rowIndex = rowData["MUI_ID"];
    const colIndex = event.target["cellIndex"];
    const value = event.target.getAttribute("value");
    if (numCols <= colIndex && colIndex < numCols + anchorState.kCandidates) {
      event.target["bgColor"] = "#ff9800";
      updateTargetCell(rowIndex, value);
    }
  };

  const updateTargetCell = (row, value) => {
    const data = [...dataState.data];
    const header = dataState.columns[anchorState.targetIndex].title;
    data[row][header] = value;
    updateDataState({
      ...dataState,
      data: data,
    });
  };

  const onSelectTarget = (target) => {
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

  const onCallImpute = async () => {
    let tableData = JSON.parse(JSON.stringify(dataState.dataObject));
    for (let i = 0; i < numCols; i++) {
      if (!(anchorState.selectedPivots[i] || i === anchorState.targetIndex)) {
        const header = dataState.columns[i].title;
        delete tableData[header];
      }
    }
    const targetName = dataState.columns[anchorState.targetIndex].title;
    const k = anchorState.kCandidates;
    const useFixed = true;
    const givenFixed = null;

    // let kDataArr = await getKCandidatesTest();
    let kDataArr = await getKCandidates(
      tableData,
      targetName,
      k,
      useFixed,
      givenFixed
    );
    console.log("Received Server Response");
    let kHeaders = [];
    let kDataObject = {};
    for (let i = 0; i < kDataArr.length; i++) {
      let header = Object.keys(kDataArr[i])[0];
      kHeaders.push(header);
      kDataObject[header] = kDataArr[i][header];
    }
    let newDataObject = { ...dataState.dataObject, ...kDataObject };
    updateDataState({
      ...dataState,
      ...dataToTable(newDataObject),
      kHeaders: kHeaders,
    });
    updateAnchorState({ ...anchorState, disable: true });
  };

  const onCancelChanges = () => {
    updateDataState({
      ...dataState,
      ...dataToTable(dataState.dataObject),
      kHeaders: [],
      chosenValues: [],
    });
  };

  const onSaveChanges = () => {
    let newDataObject = { ...dataState.dataObject };
    const header = dataState.columns[anchorState.targetIndex].title;
    newDataObject[header] = dataState.chosenValues;
    updateDataState({
      ...dataState,
      dataObject: newDataObject,
      ...dataToTable(newDataObject),
      kHeaders: [],
      chosenValues: [],
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
        toggleDrawer={onToggleDrawer}
        callImpute={onCallImpute}
        saveChanges={onSaveChanges}
        cancelChanges={onCancelChanges}
        cellClick={onCellClick}
      ></Table>
    </div>
  );
};
