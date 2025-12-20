import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from "react-toastify";

const LoginForm = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.REACT_APP_BASE_URL;

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/users/login`,
        { email, password }
      );

      const { token, user, message } = res.data;

      // 🔐 Save auth data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem(
        "userName",
        user.fullName || user.name || user.username || ""
      );
      localStorage.setItem("userPhoto", user.photo || "");

      // 🎯 Role-based redirect
      if (user.role === "coach") {
        const cohorts = user.cohorts || [];
        localStorage.setItem("userCohorts", JSON.stringify(cohorts));

        // Pick first available cohort
        const availableCohort = cohorts.find((c) => c?._id) || null;

        if (availableCohort) {
          localStorage.setItem("selectedCohortId", availableCohort._id);
          navigate(`/coach/${availableCohort._id}`);
        } else {
          navigate("/coach");
        }
      } else if (user.role === "owner") {
        navigate("/owner");
      } else {
        navigate("/student/dashboard");
      }

      // 🔔 Notify app
      window.dispatchEvent(new Event("userUpdated"));

      toast.success(message || "Login successful 🎉");
    } catch (error) {
      console.error("❌ Login error:", error.response?.data || error);

      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  // const handleLogin = async (e) => {
  //   e.preventDefault();

  //   if (!email || !password) {
  //     alert("Please fill in all fields");
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     const res = await axios.post(
  //       `${import.meta.env.VITE_BASE_URL}/api/users/login`,
  //       { email, password }
  //     );

  //     const { token, user } = res.data;

  //     // Save token and basic user info
  //     localStorage.setItem("token", token);
  //     localStorage.setItem("user", JSON.stringify(user));
  //     localStorage.setItem(
  //       "userName",
  //       user.fullName || user.name || user.username || ""
  //     );
  //     localStorage.setItem("userPhoto", user.photo || "");

  //     if (user.role === "coach") {
  //       const cohorts = user.cohorts || [];
  //       localStorage.setItem("userCohorts", JSON.stringify(cohorts));

  //       // ✅ Pick the first available cohort as default
  //       const availableCohort = cohorts.find((c) => c._id) || null;

  //       if (availableCohort) {
  //         localStorage.setItem("selectedCohortId", availableCohort._id);
  //         navigate(`/coach/${availableCohort._id}`);
  //       } else {
  //         // fallback if no cohort exists
  //         navigate("/coach");
  //       }
  //     } else if (user.role === "owner") {
  //       navigate("/owner");
  //     } else {
  //       navigate("/student/dashboard");
  //     }

  //     window.dispatchEvent(new Event("userUpdated"));
  //     alert(res.data.message || "Login successful!");
  //   } catch (error) {
  //     console.error("❌ Login error:", error.response?.data || error);
  //     alert(error.response?.data?.message || "Login failed!");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #065f46 0%, #16a34a 100%)",
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={12}
          component={motion.div}
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          sx={{
            p: 4,
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(8px)",
            color: "#fff",
          }}
        >
          <Typography
            variant="h4"
            textAlign="center"
            color="white"
            gutterBottom
            sx={{
              fontWeight: "bold",
              textShadow: "1px 1px 3px rgba(0,0,0,0.3)",
            }}
          >
            Welcome Back
          </Typography>

          <Typography
            variant="body2"
            textAlign="center"
            sx={{ mb: 3, opacity: 0.8 }}
            color="inherit"
          >
            Login to your HGSC² Digital Skills account
          </Typography>

          <motion.form
            onSubmit={handleLogin}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              variant="filled"
              sx={{
                mb: 2,
                bgcolor: "rgba(255,255,255,0.95)",
                borderRadius: 1,
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              variant="filled"
              sx={{
                mb: 3,
                bgcolor: "rgba(255,255,255,0.95)",
                borderRadius: 1,
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePassword}
                      edge="end"
                      sx={{ color: "#14532d" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box textAlign="center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  type="submit"
                  disabled={loading}
                  sx={{
                    px: 6,
                    py: 1.5,
                    borderRadius: 3,
                    backgroundColor: "#14532d",
                    fontWeight: "bold",
                    "&:hover": { backgroundColor: "#15803d" },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Login"
                  )}
                </Button>
              </motion.div>
            </Box>

            <Typography
              variant="body2"
              textAlign="center"
              sx={{ mt: 3, color: "#fff" }}
            >
              Don’t have an account?{" "}
              <Link
                to="/register"
                style={{
                  color: "#9ae6b4",
                  fontWeight: "bold",
                  textDecoration: "none",
                }}
              >
                Create one
              </Link>
            </Typography>
          </motion.form>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginForm;
