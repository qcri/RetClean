export function taskList() {
  const uri = `http://localhost:5000/task`;
  return fetch(uri).then((response) => response.json());
}

export function taskSingle(key) {
  const uri = `http://localhost:5000/task/${key}`;
  return fetch(uri).then((response) => response.json());
}

export function getTaskOptions(data) {
  let options = [];
  let i = 0;
  for (let item in data) {
    options.push({ key: i, label: data[item]["name"], value: item });
    i += 1;
  }
  return options;
}
