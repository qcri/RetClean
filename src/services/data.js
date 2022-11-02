import * as d3 from "d3";

export async function uploadData(file, taskName) {
  let data = new FormData();
  data.append("file", file);
  data.append("task_name", taskName);
  const uri = `http://localhost:5000/data`;
  return fetch(uri, {
    method: "POST",
    body: data,
  }).then((response) => response.json());
}

export function getParsedData(input) {
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

export function createDataObject(objArr) {
  let _ = require("lodash");
  let objArrCloned = _.cloneDeep(objArr);

  let dataObject = {};
  for (let i = 0; i < objArrCloned.length; i++) {
    for (const header of objArr.columns) {
      if (checkEmpty(objArrCloned[i][header])) objArrCloned[i][header] = "NULL";
      header in dataObject
        ? dataObject[header].push(objArrCloned[i][header])
        : (dataObject[header] = [objArrCloned[i][header]]);
    }
  }
  return dataObject;
}

function checkEmpty(value) {
  const valueTrimmed = value.trim().toLowerCase();
  return (
    valueTrimmed.length === 0 ||
    valueTrimmed === "none" ||
    valueTrimmed === "n/a"
  );
}
