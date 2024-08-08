export const getModels = async () => {
  const uri = "http://localhost:8000/model";
  try {
    const response = await fetch(uri);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting models:", error);
    throw error;
  }
};
