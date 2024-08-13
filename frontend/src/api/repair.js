export const getRepairs = async (payload) => {
  const uri = "http://localhost:8000/repair";
  try {
    const data = fetch(uri, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then((res) => res.json());
    return data;
  } catch (error) {
    console.error("Error posting repair:", error);
    throw error;
  }
};
