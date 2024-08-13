import * as d3 from "d3";

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
