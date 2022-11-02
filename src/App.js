import { Routes, Route } from "react-router-dom";
import { HomePage, DataPage, TablePage } from "./routes";
import MaterialTableGettingHoldOfRenderData from "./routes/Temp/temp";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />}></Route>
      <Route path="/data" element={<DataPage />}></Route>
      <Route path="/table" element={<TablePage />}></Route>
      <Route
        path="/ye"
        element={<MaterialTableGettingHoldOfRenderData />}
      ></Route>
    </Routes>
  );
}

export default App;
