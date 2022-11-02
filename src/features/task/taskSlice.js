import { createSlice } from "@reduxjs/toolkit";

export const taskSlice = createSlice({
  name: "task",
  initialState: {
    value: {
      key: "",
      name: "",
      description: "",
      headers: [],
      annotation_instructions: "",
    },
  },
  reducers: {
    updateTask: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { updateTask } = taskSlice.actions;

export default taskSlice.reducer;
