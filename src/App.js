import { Routes, Route } from "react-router-dom";
import { HomePage, DataPage, TablePage } from "./routes";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />}></Route>
      <Route path="/data" element={<DataPage />}></Route>
      <Route path="/table" element={<TablePage />}></Route>
    </Routes>
  );
}

export default App;
