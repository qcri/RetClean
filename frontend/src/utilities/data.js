import * as d3 from "d3";

export async function getRepairsMock(type, payload) {
  const uri = `http://localhost:4000/${type}`;
  return fetch(uri, {
    method: "GET",
  }).then((response) => response.json());
}

export async function getRepairs(data) {
  const uri = `http://localhost:9690/repair_table`;
  let formData = new FormData();
  formData.append("json_data", JSON.stringify(data["json_data"]));
  formData.append("entity_described", data["entity_described"]);
  formData.append("dirty_column", data["dirty_column"]);
  formData.append("index_name", data["index_name"]);
  formData.append("custom_prompt", data["custom_prompt"]);
  formData.append("index_type", JSON.stringify(data["index_type"]));
  formData.append("reasoner_type", JSON.stringify(data["reasoner_type"]));
  formData.append("reranker_type", JSON.stringify(data["reranker_type"]));
  formData.append(
    "finetuning_set",
    new Blob([data["finetuning_set"]], { type: "text/csv" }),
    "finetune_file_name"
  );
  for (const file of data["datalake"]) {
    formData.append(
      file.name,
      new Blob([file], { type: "text/csv" }),
      file.name
    );
  }
  console.log(formData);
  return fetch(uri, {
    method: "POST",
    body: formData,
    // headers: { "Content-Type": "application/json" },
    // body: body,
  }).then((response) => response.json());
}

export function parseData(input, type) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const data = d3.csvParse(text);
      resolve(data);
    };
    reader.readAsText(input);
  });
}
export function cleanData(objArr) {
  const columns = objArr.columns;
  let cleanObjArr = [];
  for (let rowObj of objArr) {
    for (const header of columns) {
      if (checkEmpty(rowObj[header])) rowObj[header] = "NULL";
    }
    cleanObjArr.push(rowObj);
  }
  return { cleanObjArr, columns };
}

function checkEmpty(value) {
  const valueTrimmed = value.trim().toLowerCase();
  return (
    valueTrimmed.length === 0 ||
    valueTrimmed === "none" ||
    valueTrimmed === "null" ||
    valueTrimmed === "n/a"
  );
}

export function prepareData(objArr, ids, dirtyColumn, pivotColumns) {
  let dirtyColumData = [];
  let pivotColumData = [];
  for (let id of ids) {
    const dirtyObj = { id: id, value: objArr[id][dirtyColumn] };
    dirtyColumData.push(dirtyObj);

    let values = [];
    for (let pivotColumn of pivotColumns) {
      values.push(objArr[id][pivotColumn]);
    }
    const pivotObj = { id: id, values: values };
    pivotColumData.push(pivotObj);
  }
  return { dirtyColumData, pivotColumData };
}
