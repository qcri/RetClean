import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";

import { parseData, cleanData, prepareData } from "../../utilities/data";

import { repairs } from "../../api/repair";
import { getModels } from "../../api/model";
import { getIndexes } from "../../api/index";

import Panel from "../../components/Panel";
import DataTable from "../../components/DataTable";
import Evidence from "../../components/Evidence";

const RepairModule = () => {
  const repairOptionDefaultStrings = { Any: "*", Null: "NULL", Custom: "" };

  // States
  const [reasonersList, setReasonersList] = useState([]);
  const [searchIndexList, setSearchIndexList] = useState([]);

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
    // const fetchModels = async () => {
    //   const models = await getModels();
    //   reasonersList(models);
    // };
    // fetchModels();
    // const fetchIndexes = async () => {
    //   const indexes = await getIndexes();
    //   setSearchIndexList(indexes);
    // };
    // const indexData = fetchIndexes();
    // setSearchIndexList(indexData["indexes"]);

    let reasoners = [
      { name: "Cloud Models", options: ["gpt", "claude"] },
      { name: "Local Models", options: ["llama2", "falcon"] },
    ];
    setReasonersList(reasoners);
    let searchIndexes = ["this one", "that one"];
    setSearchIndexList(searchIndexes);
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

    let indexType = "";
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

    let rerankerType = "";
    if (configuration.rerankState["ColBERT"]) {
      rerankerType = "ColBERT";
    } else if (configuration.rerankState["Cross Encoder"]) {
      rerankerType = "Cross Encoder";
    }

    const requestObj = {
      entity_description: entityDescription,
      target_name: configuration.dirtyColumn,
      target_data: dirtyColumData,
      pivot_names: Array.from(configuration.pivotColumns),
      pivot_data: pivotColumData,
      reasoner_name: configuration.reasonerName,
      index_name: configuration.searchIndexName,
      index_type: indexType,
      reranker_type: rerankerType,
    };

    const repairs = await repairs(requestObj);

    let marked = new Set();
    let content = [...dirtyData.content];
    let data = [];
    let j = 0;
    for (let i = 0; i < dirtyData.content.length; i++) {
      let rowObj = content[i];
      if (dirtyData.rows.has(i)) {
        const repairValue = repairs[j]["repair"];
        rowObj[result.column] = repairValue;
        data.push(repairs[j]);
        if (repairValue !== "UNKNOWN") marked.add(i);
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
    let sourceTuple = dataObj["source"];
    let sourceTableName = dataObj["table"];
    let sourceRowNumber = dataObj["row"];

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

  return (
    <Box
      display="flex"
      height="100%"
      width="100%"
      sx={{ border: 5, borderColor: "#545454" }}
    >
      <Box
        id="left"
        flex={3}
        display="flex"
        sx={{ borderRight: 5, borderColor: "#545454" }}
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
          repairOptionDefaultStrings={configuration.repairOptionDefaultStrings}
          pivotColumns={configuration.pivotColumns}
          onSelectPivotColumns={onSelectPivotColumns}
          reasonerName={configuration.reasonerName}
          reasonerNames={reasonersList}
          onSelectReasonerName={onSelectReasonerName}
          searchIndexName={configuration.searchIndexName}
          searchIndexNames={searchIndexList}
          onSelectSearchIndexName={onSelectSearchIndexName}
          indexState={configuration.indexState}
          onChangeIndexType={onChangeIndexType}
          rerankState={configuration.rerankState}
          onChangeRerankType={onChangeRerankType}
          load={result.load}
          onRunJob={onRunJob}
        />
      </Box>
      <Box
        id="right"
        flex={10}
        display="flex"
        flexDirection="column"
        overflow="auto"
      >
        <Box id="rightTop" flex={4} display="flex" flexGrow={1}>
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
            isIndexSelected={Object.values(configuration.indexState).some(
              (value) => value
            )}
            result={result}
            onMarkResult={onMarkResult}
            onShowEvidence={onShowEvidence}
            onApplyRepairs={onApplyRepairs}
          />
        </Box>
        <Box
          id="rightBottom"
          sx={{
            borderTop: result.sourceTuple !== null ? 5 : 0,
            borderColor: "#545454",
          }}
        >
          {result.sourceTuple !== null && (
            <Evidence
              sourceTuple={result.sourceTuple}
              sourceTableName={result.sourceTableName}
              sourceRowNumber={result.sourceRowNumber}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default RepairModule;