import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { MainPage } from "./routes";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Box } from "@mui/material";
import { lightTheme, darkTheme } from "./themes";

const App = () => {
  const appname = "RetClean";
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const currentMode = !darkMode;
    localStorage.setItem("darkMode", currentMode);
    setDarkMode(currentMode);
  };
  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box>
        <Routes>
          <Route
            path="/"
            element={
              <MainPage
                appname={appname}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            }
          ></Route>
        </Routes>
      </Box>
    </ThemeProvider>
  );
};

export default App;
