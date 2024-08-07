export const repairs = async (payload) => {
  const uri = "http://localhost:8000/repair";
  let formData = new FormData();
  try {
    formData.append("entity_description", payload["entity_description"]);
    formData.append("target_name", payload["target_name"]);
    formData.append("target_data", payload["target_data"]);
    formData.append("pivot_names", payload["pivot_names"]);
    formData.append("pivot_data", payload["pivot_data"]);
    formData.append("reasoner_name", payload["reasoner_name"]);
    formData.append("index_name", payload["index_name"]);
    formData.append("index_type", payload["index_type"]);
    formData.append("reranker_type", payload["reranker_type"]);
    const response = fetch(uri, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
  } catch (error) {
    console.error("Error posting repair:", error);
    throw error;
  }
};
