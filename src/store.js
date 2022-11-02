import { configureStore } from "@reduxjs/toolkit";
import taskReducer from "./features/task/taskSlice";
import dataReducer from "./features/data/dataSlice";

export default configureStore({
  reducer: {
    task: taskReducer,
    data: dataReducer,
  },
});
