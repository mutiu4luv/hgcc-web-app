import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter } from "react-router-dom";

// ✅ Define your custom colors here
const primaryGreen = "#065f46"; // deep green
const secondaryGreen = "#16a34a"; // lighter green
const lightGreen = "#22c55e"; // bright accent green

const theme = createTheme({
  palette: {
    primary: {
      main: primaryGreen,
    },
    secondary: {
      main: secondaryGreen,
    },
    success: {
      main: lightGreen,
    },
    custom: {
      dark: primaryGreen,
      medium: secondaryGreen,
      light: lightGreen,
      white: "#FFFFFF",
      black: "#000000",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
    h4: { fontWeight: 700, color: primaryGreen },
    h5: { fontWeight: 600, color: primaryGreen },
    h6: { fontWeight: 500, color: primaryGreen },
    body1: { color: "#333" },
    body2: { color: "#555" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          transition: "transform 0.2s ease-in-out",
          "&:hover": { transform: "translateY(-2px)" },
        },
        containedPrimary: {
          backgroundColor: lightGreen,
          color: "#fff",
          "&:hover": { backgroundColor: secondaryGreen },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
          },
        },
      },
    },
  },
});

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </React.StrictMode>
  </BrowserRouter>
);
