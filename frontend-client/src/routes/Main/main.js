import React, { useState } from "react";
import { Box } from "@mui/material";
import {
  parseData,
  cleanData,
  prepareDirtyData,
  getRepairs,
  getRepairs2,
} from "../../services/data";

import Header from "../../components/Header";
import Panel from "../../components/Panel";
import DataTable from "../../components/DataTable";
import Evidence from "../../components/Evidence";

export const MainPage = () => {
  // STATES
  const [dirtyData, setDirtyData] = useState({
    fileName: "No file selected",
    content: null,
    columns: [],
    rows: new Set(),
  });

  const [dataLake, setDataLake] = useState({
    fileName: "No file selected",
    indexName: "",
    content: [],
  });

  const [fineTune, setFineTune] = useState({
    fileName: "No file selected",
    content: null,
  });

  const [configuration, setConfiguration] = useState({
    entityName: "",
    dirtyColumn: "",
    pivotColumns: new Set(),
    prompt: "",

    indexState: { "Elastic Search": true, Faiss: false },
    rerankState: { ColBERT: false, "Cross Encoder": false },
    reasonState: { ChatGPT: true, "Local Model": false },
  });

  const [result, setResult] = useState({
    column: "RetClean Results",
    data: [],
    marked: new Set(),
    sourceTuple: null,
    sourceTableName: null,
    sourceRowNumber: null,
  });

  // METHODS
  const onRunJob = async () => {
    const isDirtyDataUploaded =
      dataLake.content.length !== 0 || dataLake.indexName.length !== 0;

    const requestObj = {
      json_data: prepareDirtyData(
        dirtyData.content,
        dirtyData.rows,
        configuration.dirtyColumn,
        configuration.pivotColumns
      ),
      entity_described:
        configuration.entityName.length !== 0 ? configuration.entityName : null,
      dirty_column: configuration.dirtyColumn,
      index_name: dataLake.indexName.length !== 0 ? dataLake.indexName : null,
      custom_prompt:
        configuration.prompt.length !== 0 ? configuration.prompt : null,
      index_type: {
        ES: isDirtyDataUploaded && configuration.indexState["Elastic Search"],
        FAISS: isDirtyDataUploaded && configuration.indexState["Faiss"],
      },
      reasoner_type: {
        chat: configuration.reasonState["ChatGPT"],
        local: configuration.reasonState["Local Model"],
      },
      reranker_type: {
        colbert: configuration.rerankState["ColBERT"],
        crossencoder: configuration.rerankState["Cross Encoder"],
      },
      datalake_file_name: dataLake.fileName,
      datalake: dataLake.content,
      finetune_file_name: fineTune.fileName,
      finetuning_set: fineTune.content,
    };

    // const repairs = await getRepairs("retrieval_based", {});
    const repairs = await getRepairs2(requestObj);

    let marked = new Set();
    let content = [...dirtyData.content];
    let j = 0;
    for (let i = 0; i < dirtyData.content.length; i++) {
      let rowObj = content[i];
      if (dirtyData.rows.has(i)) {
        const repairValue = repairs[j]["repair"];
        rowObj[result.column] = repairValue;
        if (repairValue !== "UNKNOWN") marked.add(i);
        j++;
      } else {
        rowObj[result.column] = "";
      }
      content[i] = rowObj;
    }

    setResult({
      ...result,
      data: repairs,
      marked: marked,
      sourceTuple: null,
      sourceTableName: null,
      sourceRowNumber: null,
    });
    setDirtyData({
      ...dirtyData,
      content: content,
    });
  };

  const onChangeDirtyDataFile = async (file) => {
    let content = await parseData(file, "csv");
    content = cleanData(content);
    const rows = new Set(Array(content.cleanObjArr.length).keys());

    setConfiguration({
      ...configuration,
      entityName: "",
      dirtyColumn: "",
      pivotColumns: new Set(),
      prompt: "",
    });
    setResult({
      ...result,
      data: [],
      marked: new Set(),
      sourceTuple: null,
      sourceTableName: null,
      sourceRowNumber: null,
    });
    setDirtyData({
      ...dirtyData,
      fileName: file.name,
      content: content.cleanObjArr,
      columns: content.columns,
      rows: rows,
    });
  };

  const onChangeDataLakeFile = async (fileList) => {
    let fileName = fileList[0].webkitRelativePath.split("/")[0];
    let content = [...fileList];
    console.log(content);

    setDataLake({
      ...dataLake,
      fileName: fileName,
      indexName: "",
      content: content,
    });
  };

  const onChangeFineTuneFile = (file) => {
    setFineTune({
      ...fineTune,
      fileName: file.name,
      content: file,
    });
  };

  const onChangeEntityName = (value) => {
    setConfiguration({
      ...configuration,
      entityName: value,
    });
  };

  const onChangeIndexName = (value) => {
    setDataLake({
      ...dataLake,
      indexName: value,
    });
  };

  const onChangePrompt = (value) => {
    setConfiguration({
      ...configuration,
      prompt: value,
    });
  };

  const onSelectDirtyColumn = (value) => {
    const filteredRows = new Set(
      Array.from(dirtyData.content.entries())
        .filter(([_, rowObj]) => rowObj[value] === "NULL")
        .map(([index, _]) => index)
    );

    setConfiguration({
      ...configuration,
      dirtyColumn: value,
    });

    setDirtyData({
      ...dirtyData,
      rows: filteredRows,
    });
  };

  const onSelectPivotColumns = (value) => {
    value = new Set(value);

    setConfiguration({
      ...configuration,
      pivotColumns: value,
    });
  };

  const onSelectRetrieveOptions = (option) => {
    if (option in configuration.indexState) {
      let indexState = { "Elastic Search": false, Faiss: false };
      indexState[option] = true;

      setConfiguration({
        ...configuration,
        indexState: indexState,
      });
    } else if (option in configuration.reasonState) {
      let reasonState = { ChatGPT: false, "Local Model": false };
      reasonState[option] = true;

      setConfiguration({
        ...configuration,
        reasonState: reasonState,
      });
    } else if (option in configuration.rerankState) {
      let currOptionState = configuration.rerankState[option];
      let rerankState = { ColBERT: false, "Cross Encoder": false };
      rerankState[option] = !currOptionState;

      setConfiguration({
        ...configuration,
        rerankState: rerankState,
      });
    }
  };

  const onMarkResult = (index) => {
    let marked = new Set([...result.marked]);
    marked.has(index) ? marked.delete(index) : marked.add(index);

    setResult({
      ...result,
      marked,
    });
  };

  const onShowEvidence = (index) => {
    let dataObj = result.data[index];
    let sourceTuple = dataObj["source"];
    let sourceTableName = dataObj["table"];
    let sourceRowNumber = dataObj["index"];

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
      const filteredRows = new Set(
        Array.from(dirtyData.content.entries())
          .filter(([_, rowObj]) => rowObj[configuration.dirtyColumn] === "NULL")
          .map(([index, _]) => index)
      );

      setResult({
        ...result,
        data: [],
        marked: new Set(),
        sourceTuple: null,
        sourceTableName: null,
        sourceRowNumber: null,
      });

      setDirtyData({
        ...dirtyData,
        content: content,
        rows: filteredRows,
      });
    }
  };

  return (
    <Box id="outer" sx={{ display: "flex", mx: 4, flexDirection: "column" }}>
      <Box id="header" sx={{ flex: 1 }}>
        <Header text="RetClean" />
      </Box>
      <Box
        id="body"
        sx={{
          flex: 10,
          display: "flex",
          flexDirection: "row",
          border: 5,
          borderColor: "#545454",
        }}
      >
        <Box
          id="left"
          sx={{
            flex: 1,
            borderRight: 5,
            borderColor: "#545454",
          }}
        >
          <Panel
            dirtyDataFileName={dirtyData.fileName}
            isDirtyDataUploaded={dataLake.content !== null}
            columns={dirtyData.columns}
            onChangeDirtyDataFile={onChangeDirtyDataFile}
            entityName={configuration.entityName}
            onChangeEntityName={onChangeEntityName}
            dirtyColumn={configuration.dirtyColumn}
            onSelectDirtyColumn={onSelectDirtyColumn}
            pivotColumns={configuration.pivotColumns}
            onSelectPivotColumns={onSelectPivotColumns}
            dataLakeFileName={dataLake.fileName}
            indexName={dataLake.indexName}
            onChangeIndexName={onChangeIndexName}
            isDataLakeUploaded={
              dataLake.content.length !== 0 || dataLake.indexName.length !== 0
            }
            onChangeDataLakeFile={onChangeDataLakeFile}
            indexState={configuration.indexState}
            rerankState={configuration.rerankState}
            reasonState={configuration.reasonState}
            onSelectRetrieveOptions={onSelectRetrieveOptions}
            fineTuneFileName={fineTune.fileName}
            onChangeFineTuneFile={onChangeFineTuneFile}
            prompt={configuration.prompt}
            onChangePrompt={onChangePrompt}
            onRunJob={onRunJob}
          />
        </Box>
        <Box
          id="right"
          sx={{
            flex: 3,
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
          }}
        >
          <Box
            id="rightTop"
            sx={{
              flex: 4,
            }}
          >
            <DataTable
              dirtyDataContent={dirtyData.content}
              isDirtyDataUploaded={dirtyData.content !== null}
              columns={
                result.data.length === 0
                  ? dirtyData.columns
                  : [...dirtyData.columns, result.column]
              }
              onChangeDirtyDataFile={onChangeDirtyDataFile}
              dirtyColumn={configuration.dirtyColumn}
              pivotColumns={configuration.pivotColumns}
              isDataLakeUploaded={
                dataLake.content.length !== 0 || dataLake.indexName.length !== 0
              }
              result={result}
              onMarkResult={onMarkResult}
              onShowEvidence={onShowEvidence}
              onApplyRepairs={onApplyRepairs}
            />
          </Box>
          <Box
            id="rightBottom"
            sx={{
              flex: 1,
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
    </Box>
  );
};
