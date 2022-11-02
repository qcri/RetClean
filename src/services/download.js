export function downloadData(dataId) {
  const uri = `http://localhost:5000/download/${dataId}`;
  return fetch(uri)
    .then((res) => {
      return res.blob();
    })
    .then((data) => {
      var link = document.createElement("a");
      link.href = window.URL.createObjectURL(data);
      link.download = "annotated_data.csv";
      link.click();
    });
}
