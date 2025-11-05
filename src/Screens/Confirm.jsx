// src/screens/ConfirmCode.jsx
import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Box,
} from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const ConfirmCode = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!otp) return alert("Please enter your confirmation code");

    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/users/verify-email`,
        {
          email,
          otp,
        }
      );
      console.log(import.meta.env.VITE_BASE_URL);
      alert(res.data.message || "Account verified successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Verification failed:", error.response?.data || error);
      alert(error.response?.data?.message || "Invalid or expired code!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper
        component={motion.div}
        elevation={6}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        sx={{
          p: 5,
          borderRadius: 4,
          background: "linear-gradient(135deg, #064e3b 0%, #10b981 100%)",
          color: "#fff",
        }}
      >
        <Typography variant="h4" textAlign="center" gutterBottom color="white">
          Confirm Your Account
        </Typography>
        <Typography textAlign="center" sx={{ mb: 3 }}>
          A 6-digit confirmation code was sent to your email: <b>{email}</b>
        </Typography>

        <form onSubmit={handleConfirm}>
          <TextField
            fullWidth
            label="Enter Confirmation Code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            sx={{
              mb: 3,
              background: "#fff",
              borderRadius: 2,
            }}
          />

          <Box textAlign="center">
            <Button
              variant="contained"
              color="success"
              type="submit"
              disabled={loading}
              sx={{
                px: 5,
                py: 1.5,
                borderRadius: 3,
                backgroundColor: "#14532d",
                "&:hover": { backgroundColor: "#15803d" },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Verify Account"
              )}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default ConfirmCode;
