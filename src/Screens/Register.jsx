import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Checkbox,
  FormControlLabel,
  Paper,
  CircularProgress,
  Avatar,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import UploadIcon from "@mui/icons-material/CloudUpload";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const RegisterForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    country: "",
    acceptedTerms: false,
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePhoto(file);
    if (file) setPreviewUrl(URL.createObjectURL(file));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate terms
    if (!formData.acceptedTerms) {
      alert("Please accept the terms & conditions");
      return;
    }

    // Validate photo
    if (!profilePhoto) {
      alert("Please upload a profile photo");
      return;
    }

    // Prepare FormData
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (profilePhoto) data.append("profilePhoto", profilePhoto);

    try {
      setLoading(true);
      const res = await axios.post(
        // alert("registration coming soon"),
        `${import.meta.env.VITE_BASE_URL}/api/users/register`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("✅ Registration response:", res.data);
      alert(res.data.message || "Registered successfully!");

      navigate("/student/dashboard", { state: { email: formData.email } });
    } catch (error) {
      console.error("❌ Registration failed:", error);
      if (error.response) {
        alert(error.response.data.message || "Registration failed!");
      } else {
        alert("Server not responding. Check your internet or backend.");
      }
    } finally {
      setLoading(false);
    }
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
            gutterBottom
            color="white"
            sx={{
              fontWeight: "bold",
              textShadow: "1px 1px 3px rgba(0,0,0,0.3)",
            }}
          >
            Create Your Account
          </Typography>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              {/* Full Name */}
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                variant="filled"
                sx={{
                  mb: 2,
                  bgcolor: "rgba(255,255,255,0.95)",
                  borderRadius: 1,
                }}
              />

              {/* Email */}
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                variant="filled"
                sx={{
                  mb: 2,
                  bgcolor: "rgba(255,255,255,0.95)",
                  borderRadius: 1,
                }}
              />

              {/* Password */}
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                variant="filled"
                sx={{
                  mb: 2,
                  bgcolor: "rgba(255,255,255,0.95)",
                  borderRadius: 1,
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Phone Number */}
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                variant="filled"
                sx={{
                  mb: 2,
                  bgcolor: "rgba(255,255,255,0.95)",
                  borderRadius: 1,
                }}
              />

              {/* Country */}
              <TextField
                fullWidth
                label="Country"
                name="country"
                required
                value={formData.country}
                onChange={handleChange}
                variant="filled"
                sx={{
                  mb: 2,
                  bgcolor: "rgba(255,255,255,0.95)",
                  borderRadius: 1,
                }}
              />

              {/* Upload Photo */}
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <label htmlFor="profilePhoto">
                    <Box
                      sx={{
                        border: "2px dashed #9ae6b4",
                        borderRadius: 3,
                        p: 3,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        "&:hover": {
                          borderColor: "#34d399",
                          background: "rgba(255,255,255,0.1)",
                        },
                      }}
                    >
                      {previewUrl ? (
                        <Avatar
                          src={previewUrl}
                          alt="Preview"
                          sx={{
                            width: 100,
                            height: 100,
                            mb: 1.5,
                            border: "3px solid #34d399",
                          }}
                        />
                      ) : (
                        <UploadIcon sx={{ fontSize: 50, mb: 1 }} />
                      )}
                      <Typography variant="body2">
                        {previewUrl ? "Change Photo" : "Upload Profile Photo"}
                      </Typography>
                      <input
                        id="profilePhoto"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                      />
                    </Box>
                  </label>
                </motion.div>
              </Box>

              {/* Terms & Conditions */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.acceptedTerms}
                    onChange={handleChange}
                    name="acceptedTerms"
                    sx={{ color: "#fff" }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: "#fff" }}>
                    I agree to the terms & conditions
                  </Typography>
                }
              />

              {/* Submit */}
              <Box mt={3} textAlign="center">
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
                      "Register"
                    )}
                  </Button>
                </motion.div>
              </Box>
            </form>
          </motion.div>

          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 3, color: "#fff" }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "#a7f3d0",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Login
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterForm;
