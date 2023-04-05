import { Routes, Route } from "react-router-dom";
import { MainPage } from "./routes";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />}></Route>
    </Routes>
  );
}

export default App;
