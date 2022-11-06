import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  dataToTable,
  getNullRows,
  alignImputed,
  getKCandidates,
  getKCandidatesTest,
} from "../../services/table";

import Directions from "../../components/Directions";
import Table from "../../components/Table";
import Drawer from "../../components/SlideOver";

export const TablePage = () => {
  const loadedDataState = useSelector((state) => state.data.value);
  const orginialHeaders = Object.keys(loadedDataState.dataObject);
  const numCols = orginialHeaders.length;
  const numRows = loadedDataState.dataObject[orginialHeaders[0]].length;
  const pageDirections =
    "Choose a target column for imputation. You can specify exactly which columns to use for imputation as well as the number of candate values.";
  const [dataState, updateDataState] = useState({
    filename: loadedDataState.filename,
    dataObject: loadedDataState.dataObject,
    ...dataToTable(loadedDataState.dataObject),
    kHeaders: [],
    chosenValues: [],
    chosenKHeaders: [],
  });
  const [anchorState, updateAnchorState] = useState({
    imputePhase: false,
    anchor: false,
    prevIndex: 0,
    targetIndex: numCols - 1,
    selectedPivots: [...Array(numCols)].map((x) => false),
    numK: 3,
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

  useEffect(() => {
    let columns = [...dataState.columns];
    for (let i = 0; i < dataState.kHeaders.length; i++) {
      const header = dataState.kHeaders[i];
      const index = numCols + i;
      columns[index]["cellStyle"] = (data, rowData) => {
        let id = rowData["MUI_ID"];
        return dataState.chosenKHeaders[id] === header
          ? {
              backgroundColor: "#ff9800",
              color: "#FFF",
              border: "1px solid #eee",
            }
          : { border: "1px solid #eee" };
      };
    }
    updateDataState({
      ...dataState,
      columns: columns,
    });
  }, [dataState.chosenKHeaders]);

  const onCellClick = (event, rowData) => {
    const rowIndex = rowData["MUI_ID"];
    const colIndex = event.target["cellIndex"];
    let header = dataState.columns[colIndex].title;
    let value = event.target.getAttribute("value");
    if (
      value !== "" &&
      numCols <= colIndex &&
      colIndex < numCols + anchorState.numK
    ) {
      if (header === dataState.chosenKHeaders[rowIndex]) {
        let targetHeader = dataState.columns[anchorState.targetIndex].title;
        value = dataState.dataObject[targetHeader][rowIndex];
        header = "NONE";
      }
      updateTargetCell(rowIndex, value, header);
    }
  };

  const updateTargetCell = (row, value, header) => {
    // const data = [...dataState.data];
    // const header = dataState.columns[anchorState.targetIndex].title;
    // data[row][header] = value;

    let chosenValues = [...dataState.chosenValues];
    chosenValues[row] = value;
    let chosenKHeaders = [...dataState.chosenKHeaders];
    chosenKHeaders[row] = header;
    updateDataState({
      ...dataState,
      // data: data,
      chosenValues: chosenValues,
      chosenKHeaders: chosenKHeaders,
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

  const onSelectK = (k) => updateAnchorState({ ...anchorState, numK: k });

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
    const k = anchorState.numK;
    const useFixed = false;
    const givenFixed = null;

    let { ids, filteredDataObject } = getNullRows(tableData, targetName);
    let kDataArr = await getKCandidatesTest();
    // let kDataArr = await getKCandidates(
    //   filteredDataObject,
    //   targetName,
    //   k,
    //   useFixed,
    //   givenFixed
    // );
    console.log("Received Server Response");
    let { kHeaders, kDataObject } = alignImputed(kDataArr, ids, k, numRows);
    let newDataObject = { ...dataState.dataObject, ...kDataObject };

    let chosenValues = [...dataState.dataObject[targetName]];
    let chosenKHeaders = [...Array(numRows)].map((x) => targetName);
    for (let id of ids) {
      const k1 = kHeaders[0];
      chosenValues[id] = kDataObject[k1][id];
      chosenKHeaders[id] = k1;
    }

    updateDataState({
      ...dataState,
      ...dataToTable(newDataObject),
      kHeaders: kHeaders,
      chosenValues: chosenValues,
      chosenKHeaders: chosenKHeaders,
    });
    updateAnchorState({ ...anchorState, imputePhase: true });
  };

  const onCancelChanges = () => {
    updateDataState({
      ...dataState,
      ...dataToTable(dataState.dataObject),
      kHeaders: [],
      chosenValues: [],
      chosenKHeaders: [],
    });
    updateAnchorState({ ...anchorState, imputePhase: false });
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
      chosenKHeaders: [],
    });
    updateAnchorState({ ...anchorState, imputePhase: false });
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
        numK={anchorState.numK}
        imputePhase={anchorState.imputePhase}
        toggleDrawer={onToggleDrawer}
        selectK={onSelectK}
        callImpute={onCallImpute}
        saveChanges={onSaveChanges}
        cancelChanges={onCancelChanges}
        cellClick={onCellClick}
      ></Table>
    </div>
  );
};
