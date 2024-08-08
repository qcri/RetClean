export const getIndexes = async () => {
  const uri = "http://localhost:8000/index";
  try {
    const response = await fetch(uri);
    const data = await response.json();
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
    const response = fetch(uri, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
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
    const response = fetch(uri, {
      method: "PUT",
      body: formData,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating index:", error);
    throw error;
  }
};

export const deleteIndex = async (indexName) => {
  const uri = `http://localhost:8000/index/${indexName}`;
  try {
    const response = await fetch(uri, {
      method: "DELETE",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting index:", error);
    throw error;
  }
};
