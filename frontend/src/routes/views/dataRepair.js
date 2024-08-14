import React, { useEffect, useState } from "react";
import { Box, useTheme } from "@mui/material";
import { Mosaic } from "react-loading-indicators";

import { parseData, cleanData, prepareData } from "../../utilities/data";

import { getRepairs } from "../../api/repair";
import { getModels } from "../../api/model";
import { getIndexes } from "../../api/index";

import Panel from "../../components/Panel";
import DataTable from "../../components/DataTable";
import Evidence from "../../components/Evidence";
import DragDropFile from "../../components/DragDrop";

const RepairModule = (props) => {
  const theme = useTheme();
  const borderColor = theme.palette.border.main;
  const repairOptionDefaultStrings = { Any: "*", Null: "NULL", Custom: "" };

  // States
  const [reasonersList, setReasonersList] = useState([]);

  const [dirtyData, setDirtyData] = useState({
    fileName: "No file selected",
    content: null,
    columns: [],
    rows: new Set(),
  });

  const [configuration, setConfiguration] = useState({
    entityDescription: "",
    dirtyColumn: "",
    repairOptionState: { Any: true, Null: false, Custom: false },
    repairString: "*",
    pivotColumns: new Set(),
    reasonerName: "",
    searchIndexName: "",
    indexState: { Semantic: true, Syntactic: false },
    rerankState: { ColBERT: false, "Cross Encoder": false },
  });

  const [result, setResult] = useState({
    column: "RetClean Results",
    data: [],
    marked: new Set(),
    isLoading: false,
    sourceTuple: null,
    sourceTableName: null,
    sourceRowNumber: null,
  });

  // Effects
  useEffect(() => {
    const fetchModels = async () => {
      const model_data = await getModels();
      setReasonersList(model_data.models);
    };
    fetchModels();
    const fetchIndexes = async () => {
      const indexData = await getIndexes();
      props.setSearchIndexList(indexData.indexes);
    };
    fetchIndexes();
  }, []);

  useEffect(() => {
    const selectedColumn = configuration.dirtyColumn;
    const regexString = configuration.repairString;
    if (selectedColumn === "") return;

    const regex =
      regexString === ""
        ? /^$/
        : regexString === "*"
        ? /[\s\S]*/
        : new RegExp(regexString);

    const filteredRows = new Set(
      dirtyData.content
        .map((obj, index) => (regex.test(obj[selectedColumn]) ? index : -1))
        .filter((index) => index !== -1)
    );
    setDirtyData({
      ...dirtyData,
      rows: filteredRows,
    });
  }, [
    dirtyData.content,
    configuration.dirtyColumn,
    configuration.repairString,
  ]);

  // Pre-repair Methods
  const onChangeDirtyDataFile = async (files) => {
    if (files.length === 0) return;
    const file = files[0];
    let content = await parseData(file);
    content = cleanData(content);
    const rows = new Set(content.cleanObjArr.map((_, index) => index));

    setDirtyData({
      ...dirtyData,
      fileName: file.name,
      content: content.cleanObjArr,
      columns: content.columns,
      rows: rows,
    });
    setConfiguration({
      ...configuration,
      entityDescription: "",
      dirtyColumn: "",
      repairOptionState: { Any: true, Null: false, Custom: false },
      repairString: "*",
      pivotColumns: new Set(),
    });
    setResult({
      ...result,
      data: [],
      marked: new Set(),
      sourceTuple: null,
      sourceTableName: null,
      sourceRowNumber: null,
    });
  };

  const onChangeEntityDescription = (value) => {
    setConfiguration({
      ...configuration,
      entityDescription: value,
    });
  };

  const onSelectDirtyColumn = (value) => {
    setConfiguration({
      ...configuration,
      dirtyColumn: value,
    });
  };

  const onChangeRepairOption = (value) => {
    let repairOptionState = { Any: false, Null: false, Custom: false };
    repairOptionState[value] = true;
    setConfiguration({
      ...configuration,
      repairOptionState: repairOptionState,
      repairString: value === "Any" ? "*" : value === "Null" ? "NULL" : "",
    });
  };

  const onChangeRepairString = (value) => {
    setConfiguration({
      ...configuration,
      repairString: value,
    });
  };

  const onSelectPivotColumns = (value) => {
    value = new Set(value);
    setConfiguration({
      ...configuration,
      pivotColumns: value,
    });
  };

  const onSelectReasonerName = (value) => {
    setConfiguration({
      ...configuration,
      reasonerName: value,
    });
  };

  const onSelectSearchIndexName = (value) => {
    setConfiguration({
      ...configuration,
      searchIndexName: value,
    });
  };

  const onChangeIndexType = (value) => {
    let indexState = { ...configuration.indexState };
    indexState[value] = !indexState[value];
    const allFalse = Object.values(indexState).every(
      (value) => value === false
    );
    if (allFalse) indexState[value] = true;
    setConfiguration({
      ...configuration,
      indexState: indexState,
    });
  };

  const onChangeRerankType = (value) => {
    const newVal = !configuration.rerankState[value];
    let rerankState = { ColBERT: false, "Cross Encoder": false };
    rerankState[value] = newVal;
    setConfiguration({
      ...configuration,
      rerankState: rerankState,
    });
  };

  // Repair Methods
  const onRunJob = async () => {
    setResult({ ...result, isLoading: true });

    const entityDescription =
      configuration.entityDescription !== ""
        ? configuration.entityDescription
        : null;

    const { dirtyColumData, pivotColumData } = prepareData(
      dirtyData.content,
      dirtyData.rows,
      configuration.dirtyColumn,
      configuration.pivotColumns
    );

    const indexName =
      configuration.searchIndexName !== ""
        ? configuration.searchIndexName
        : null;

    let indexType = null;
    let rerankerType = null;
    if (indexName !== null) {
      if (
        configuration.indexState["Syntactic"] &&
        configuration.indexState["Semantic"]
      ) {
        indexType = "both";
      } else if (configuration.indexState["Semantic"]) {
        indexType = "semantic";
      } else if (configuration.indexState["Syntactic"]) {
        indexType = "syntactic";
      }

      if (configuration.rerankState["ColBERT"]) {
        rerankerType = "ColBERT";
      } else if (configuration.rerankState["Cross Encoder"]) {
        rerankerType = "Cross Encoder";
      }
    }

    const requestObj = {
      entity_description: entityDescription,
      target_name: configuration.dirtyColumn,
      target_data: dirtyColumData,
      pivot_names: Array.from(configuration.pivotColumns),
      pivot_data: pivotColumData,
      reasoner_name: configuration.reasonerName,
      index_name: indexName,
      index_type: indexType,
      reranker_type: rerankerType,
    };

    setResult({ ...result, isLoading: true });
    const response = await getRepairs(requestObj);
    setResult({ ...result, isLoading: false });
    const repairs = response.results;

    let marked = new Set();
    let content = [...dirtyData.content];
    let data = [];
    let j = 0;
    for (let i = 0; i < dirtyData.content.length; i++) {
      let rowObj = content[i];
      if (dirtyData.rows.has(i)) {
        const repairValue = repairs[j].value;
        rowObj[result.column] = repairValue;
        data.push(repairs[j]);
        if (repairValue !== null) marked.add(i);
        j++;
      } else {
        rowObj[result.column] = "";
        data.push(null);
      }
      content[i] = rowObj;
    }

    setResult({
      ...result,
      data: data,
      marked: marked,
      isLoading: false,
      sourceTuple: null,
      sourceTableName: null,
      sourceRowNumber: null,
    });
    setDirtyData({ ...dirtyData, content: content });
  };

  const onMarkResult = (index) => {
    let marked = new Set([...result.marked]);
    marked.has(index) ? marked.delete(index) : marked.add(index);
    setResult({ ...result, marked: marked });
  };

  const onShowEvidence = (index) => {
    let dataObj = result.data[index];
    // give me a random hardcoded tuple of data
    let sourceTuple = { age: 25, name: "John Doe", height: 6.0, weight: 180 };
    // let sourceTuple = dataObj.tuple;
    let sourceTableName = dataObj.table_name;
    let sourceRowNumber = dataObj.row_number;

    setResult({
      ...result,
      sourceTuple: sourceTuple,
      sourceTableName: sourceTableName,
      sourceRowNumber: sourceRowNumber,
    });
  };

  const onApplyRepairs = () => {
    if (result.data.length !== 0) {
      let content = [...dirtyData.content];
      for (const index of result.marked) {
        let rowObj = content[index];
        rowObj[configuration.dirtyColumn] = rowObj[result.column];
        delete rowObj[result.column];
        content[index] = rowObj;
      }

      setResult({
        ...result,
        data: [],
        marked: new Set(),
        sourceTuple: null,
        sourceTableName: null,
        sourceRowNumber: null,
      });
      setDirtyData({ ...dirtyData, content: content });
    }
  };

  const onCancelRepairs = () => {
    setResult({
      ...result,
      data: [],
      marked: new Set(),
      sourceTuple: null,
      sourceTableName: null,
      sourceRowNumber: null,
    });
  };

  return (
    <Box
      display="flex"
      height="100%"
      width="100%"
      border={5}
      borderColor={borderColor}
    >
      <Box
        id="left"
        flex={3}
        display="flex"
        borderRight={5}
        borderColor={borderColor}
      >
        <Panel
          dirtyDataFileName={dirtyData.fileName}
          onChangeDirtyDataFile={onChangeDirtyDataFile}
          isDirtyDataUploaded={dirtyData.content !== null}
          entityDescription={configuration.entityDescription}
          onChangeEntityDescription={onChangeEntityDescription}
          columns={dirtyData.columns}
          dirtyColumn={configuration.dirtyColumn}
          onSelectDirtyColumn={onSelectDirtyColumn}
          repairOptionState={configuration.repairOptionState}
          onChangeRepairOption={onChangeRepairOption}
          isRepairOptionCustom={configuration.repairOptionState["Custom"]}
          repairString={configuration.repairString}
          onChangeRepairString={onChangeRepairString}
          repairOptionDefaultStrings={repairOptionDefaultStrings}
          pivotColumns={configuration.pivotColumns}
          onSelectPivotColumns={onSelectPivotColumns}
          reasonerName={configuration.reasonerName}
          reasonerNames={reasonersList}
          onSelectReasonerName={onSelectReasonerName}
          searchIndexName={configuration.searchIndexName}
          searchIndexNames={props.searchIndexList}
          onSelectSearchIndexName={onSelectSearchIndexName}
          indexState={configuration.indexState}
          onChangeIndexType={onChangeIndexType}
          rerankState={configuration.rerankState}
          onChangeRerankType={onChangeRerankType}
          isLoading={result.isLoading}
          onRunJob={onRunJob}
        />
      </Box>
      <Box
        id="right"
        flex={10}
        display="flex"
        flexDirection="column"
        height="100%"
      >
        {result.isLoading ? (
          <Box
            id="rightTopLoading"
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexGrow={1}
          >
            <Mosaic
              color={["#33CCCC", "#33CC36", "#B8CC33", "#FCCA00"]}
              style={{ fontSize: "80px" }}
              text="Repairing"
            />
          </Box>
        ) : (
          <>
            <Box id="rightTop" flex={4} display="flex" overflow="auto">
              {dirtyData.content === null ? (
                <DragDropFile onChange={onChangeDirtyDataFile} />
              ) : (
                <DataTable
                  dirtyDataContent={dirtyData.content}
                  columns={
                    result.data.length === 0
                      ? dirtyData.columns
                      : [...dirtyData.columns, result.column]
                  }
                  onChangeDirtyDataFile={onChangeDirtyDataFile}
                  isDirtyDataUploaded={dirtyData.content !== null}
                  dirtyColumn={configuration.dirtyColumn}
                  pivotColumns={configuration.pivotColumns}
                  isIndexSelected={configuration.searchIndexName !== ""}
                  result={result}
                  onMarkResult={onMarkResult}
                  onShowEvidence={onShowEvidence}
                  onApplyRepairs={onApplyRepairs}
                  onCancelRepairs={onCancelRepairs}
                />
              )}
            </Box>
            <Box
              id="rightBottom"
              flex={1}
              borderTop={result.sourceTuple !== null ? 5 : 0}
            >
              {result.sourceTuple !== null && (
                <Evidence
                  sourceTuple={result.sourceTuple}
                  sourceTableName={result.sourceTableName}
                  sourceRowNumber={result.sourceRowNumber}
                />
              )}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default RepairModule;
