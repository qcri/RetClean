import * as d3 from "d3";
import wretch from "wretch";

export async function getRepairs(type, payload) {
  const uri = `http://localhost:3000/${type}`;
  return wretch(uri)
    .get()
    .notFound((error) => {
      alert("404");
    })
    .unauthorized((error) => {
      alert("401");
    })
    .res((response) => response.json())
    .catch((error) => {
      alert(error);
    });
}

export async function getRepairs2(data) {
  const uri = `http://localhost:5000/repair_table`;
  const body = JSON.stringify(data);
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
      const data = type === "csv" ? d3.csvParse(text) : JSON.Parse(text);
      resolve(data);
    };
    reader.readAsText(input);
  });
}

export function prepareDirtyData(objArr, rows, dirtyColumn, pivotColumns) {
  let dataToSend = Array.from(rows).map((index) => objArr[index]);
  let relevantColumns = [...new Set([...pivotColumns, dirtyColumn])];
  let result = Object.fromEntries(relevantColumns.map((x) => [x, []]));
  for (const rowObj of dataToSend) {
    for (const col of relevantColumns) result[col].push(rowObj[col]);
  }
  return result;
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
