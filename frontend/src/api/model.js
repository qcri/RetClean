export const getModels = async () => {
  const uri = "http://localhost:8000/model";
  try {
    const data = await fetch(uri).then((res) => res.json());
    return data;
  } catch (error) {
    console.error("Error getting models:", error);
    throw error;
  }
};
