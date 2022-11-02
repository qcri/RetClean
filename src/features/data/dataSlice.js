import { createSlice } from "@reduxjs/toolkit";

export const dataSlice = createSlice({
  name: "data",
  initialState: {
    value: {
      filename: "",
      dataObject: "",
    },
  },
  reducers: {
    updateData: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { updateData } = dataSlice.actions;

export default dataSlice.reducer;
