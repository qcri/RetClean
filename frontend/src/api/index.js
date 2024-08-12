export const getIndexes = async () => {
  const uri = "http://localhost:8000/index";
  try {
    const data = await fetch(uri).then((res) => res.json());
    return data;
  } catch (error) {
    console.error("Error getting indexes:", error);
    throw error;
  }
};

export const createIndex = async (indexName, files) => {
  const uri = "http://localhost:8000/index";
  let formData = new FormData();
  try {
    formData.append("index_name", indexName);
    files.forEach((file) => {
      formData.append("files", file);
    });

    const data = await fetch(uri, {
      method: "POST",
      body: formData,
    }).then((res) => res.json());
    return data;
  } catch (error) {
    console.error("Error posting index:", error);
    throw error;
  }
};

export const updateIndex = async (indexName, files) => {
  const uri = "http://localhost:8000/index";
  let formData = new FormData();
  try {
    formData.append("index_name", indexName);
    files.forEach((file) => {
      formData.append("files", file);
    });

    const data = await fetch(uri, {
      method: "PUT",
      body: formData,
    }).then((res) => res.json());
    return data;
  } catch (error) {
    console.error("Error updating index:", error);
    throw error;
  }
};

export const deleteIndex = async (indexName) => {
  const uri = `http://localhost:8000/index/${indexName}`;
  try {
    const data = await fetch(uri, {
      method: "DELETE",
    }).then((res) => res.json());
    return data;
  } catch (error) {
    console.error("Error deleting index:", error);
    throw error;
  }
};
