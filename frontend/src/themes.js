import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    background: {
      default: "#fafafa",
      paper: "#EDEDED",
    },
    border: {
      main: "#555",
    },
    text: {
      primary: "#000000",
      dragDrop: "#000000",
    },
    custom: {
      dragDrop: {
        borderColor: "#cbd5e1",
        backgroundColor: {
          active: "#ffffff",
          inactive: "#e2e8f0",
        },
      },
      button: {
        background: "#ffffff",
      },
    },
  },
  typography: {
    fontFamily: "League Spartan",
  },
  components: {
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff", // Input fields background color
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    background: {
      default: "#121212",
      paper: "#1E1E1E",
    },
    border: {
      main: "#666",
    },
    text: {
      primary: "#ffffff",
      dragDrop: "#ffffff",
    },
    custom: {
      dragDrop: {
        borderColor: "#555",
        backgroundColor: {
          active: "#2c2c2c",
          inactive: "#141414", // Darker inactive background color
        },
      },
      button: {
        background: "#2c2c2c",
      },
    },
  },
  typography: {
    fontFamily: "League Spartan",
  },
  components: {
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: "#2c2c2c",
        },
      },
    },
  },
});
