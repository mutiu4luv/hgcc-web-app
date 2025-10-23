// src/theme.js (or wherever your theme is defined)
import { createTheme } from "@mui/material/styles";

const primaryGreen = "#0D4E0D"; // Darker green for background
const secondaryGreen = "#6B8E23"; // Olive green for highlights
const lightGreen = "#9ACD32"; // Lighter green for accents/buttons

const theme = createTheme({
  palette: {
    primary: {
      main: primaryGreen,
    },
    secondary: {
      main: secondaryGreen,
    },
    success: {
      // Using success for a bright green button color
      main: lightGreen,
    },
    // Custom colors can be added here
    custom: {
      dark: primaryGreen,
      medium: secondaryGreen,
      light: lightGreen,
      white: "#FFFFFF",
      black: "#000000",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif", // Adjust if you have a specific font
    h4: {
      fontWeight: 700,
      color: primaryGreen,
    },
    h5: {
      fontWeight: 600,
      color: primaryGreen,
    },
    h6: {
      fontWeight: 500,
      color: primaryGreen,
    },
    body1: {
      color: "#333",
    },
    body2: {
      color: "#555",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8, // Slightly rounded buttons
          transition: "transform 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
          },
        },
        containedPrimary: {
          backgroundColor: lightGreen,
          color: "#fff",
          "&:hover": {
            backgroundColor: secondaryGreen,
          },
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

export default theme;
