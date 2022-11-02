export function selectMethodList() {
  const uri = `http://localhost:5000/select`;
  return fetch(uri).then((response) => response.json());
}

export function applySelectMethod(dataId, methodId) {
  const data = JSON.stringify({ data_id: dataId });
  const uri = `http://localhost:5000/select/${methodId}`;
  return fetch(uri, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: data,
  }).then((response) => response.json());
}

export function getSelectMethodOptions(data) {
  let options = [];
  let i = 0;
  for (let item in data) {
    options.push({ key: i, label: data[item]["name"], value: item });
    i += 1;
  }
  return options;
}
