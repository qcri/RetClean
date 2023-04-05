import { configureStore } from "@reduxjs/toolkit";
import dataReducer from "./features/data/dataSlice";

export default configureStore({
  reducer: {
    data: dataReducer,
  },
});
