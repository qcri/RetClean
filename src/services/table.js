const baseURI = "https://lmimputation.qcri.org";

export function getKCandidates(data, target, k, closedSet, categories) {
  const payload = JSON.stringify({
    table: data,
    impute_col: target,
    k: k,
    use_fixed_cats: closedSet,
    given_fixed_cats: categories,
  });
  const uri = `${baseURI}/impute_gpt3_react`;
  return fetch(uri, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: payload,
  }).then((response) => response.json());
}

export function getKCandidatesTest() {
  const uri = `http://localhost:4000/impute`;
  return fetch(uri).then((response) => response.json());
}

function customFilterFn(term, rowData, fieldName) {
  const entryCased = rowData[fieldName].toLowerCase();
  const termCased = term.trim().toLowerCase();
  const condition = termCased.startsWith("!")
    ? !entryCased.startsWith(termCased.slice(1).trim())
    : entryCased.startsWith(termCased);
  return condition;
}

export function dataToTable(dataObject) {
  const headers = Object.keys(dataObject);
  let columns = headers.map((header) => {
    return {
      title: header,
      field: header,
      customFilterAndSearch: (term, rowData) =>
        customFilterFn(term, rowData, header),
    };
  });

  let data = [];
  for (let i = 0; i < dataObject[headers[0]].length; i++) {
    let row = {};
    for (const header of headers) {
      row[header] = dataObject[header][i];
    }
    data.push({ MUI_ID: i, ...row });
  }

  return { columns: columns, data: data };
}
