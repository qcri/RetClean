import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    error: {
      main: "#d32f2f",
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
      table: {
        headers: {
          color: "#ffffff",
          backgroundColor: "#000000",
        },
        border: {
          main: "#EDEDED",
        },
        resultCell: {
          backgroundColor: "#90CAF9",
        },
        emptyCell: {
          backgroundColor: "#E0E0E0",
        },
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
          backgroundColor: "#ffffff",
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
    error: {
      main: "#ff6b6b",
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
          active: "#141414",
          inactive: "#2c2c2c",
        },
      },
      button: {
        background: "#2c2c2c",
      },
      table: {
        headers: {
          color: "#000000",
          backgroundColor: "#E0E0E0",
        },
        border: {
          main: "#2A2A2A",
        },
        resultCell: {
          backgroundColor: "#1565C0",
        },
        emptyCell: {
          backgroundColor: "#424242",
        },
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
