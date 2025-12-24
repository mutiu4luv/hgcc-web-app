import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Grid,
  TextField,
  Button,
  Divider,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";

const PRIMARY = "#0B3D2E";
const ACCENT = "#14CD02";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const ProfileScreen = () => {
  const token = localStorage.getItem("token");

  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [preview, setPreview] = useState("");

  const [user, setUser] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    country: "",
    photo: "",
  });

  // 🔐 Password state
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
  });

  /**
   * ✅ FETCH LOGGED-IN USER
   */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);
        setPreview(res.data.photo || "");
      } catch {
        toast.error("Failed to load profile");
      }
    };

    fetchProfile();
  }, [token]);

  /**
   * TEXT INPUT HANDLER
   */
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  /**
   * PASSWORD INPUT HANDLER
   */
  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  /**
   * PHOTO HANDLER
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePhoto(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  /**
   * SAVE PROFILE
   */
  const handleSave = async () => {
    try {
      const data = new FormData();
      data.append("fullName", user.fullName);
      data.append("phoneNumber", user.phoneNumber);
      data.append("country", user.country);

      if (profilePhoto) data.append("profilePhoto", profilePhoto);

      // 🔐 Send password only if user wants to change it
      if (passwords.oldPassword && passwords.newPassword) {
        data.append("oldPassword", passwords.oldPassword);
        data.append("newPassword", passwords.newPassword);
      }

      const res = await axios.put(`${BASE_URL}/api/users/profile`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(res.data.user);
      setPasswords({ oldPassword: "", newPassword: "" });
      setIsEditing(false);

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <Box sx={{ minHeight: "90vh", bgcolor: "#F3F8F5", py: 5 }}>
      <Container maxWidth="md">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Paper sx={{ p: 4, borderRadius: "20px" }}>
            {/* HEADER */}
            <Box display="flex" justifyContent="space-between" mb={3}>
              <Typography variant="h4" fontWeight="bold" color={PRIMARY}>
                My Profile
              </Typography>

              {!isEditing ? (
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                  variant="outlined"
                >
                  Edit Profile
                </Button>
              ) : (
                <Box>
                  <IconButton onClick={() => setIsEditing(false)} color="error">
                    <CancelIcon />
                  </IconButton>
                  <Button
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    variant="contained"
                    sx={{ bgcolor: ACCENT, ml: 1 }}
                  >
                    Save
                  </Button>
                </Box>
              )}
            </Box>

            <Divider sx={{ mb: 4 }} />

            <Grid container spacing={4}>
              {/* AVATAR */}
              <Grid item xs={12} md={4} textAlign="center">
                <Avatar
                  src={preview}
                  sx={{
                    width: 150,
                    height: 150,
                    mx: "auto",
                    mb: 2,
                    bgcolor: PRIMARY,
                  }}
                />
                {isEditing && (
                  <Button component="label" variant="outlined">
                    Change Photo
                    <input hidden type="file" onChange={handleFileChange} />
                  </Button>
                )}
              </Grid>

              {/* FORM */}
              <Grid item xs={12} md={8}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      label="Full Name"
                      name="fullName"
                      fullWidth
                      value={user.fullName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Email"
                      fullWidth
                      value={user.email}
                      disabled
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Phone Number"
                      name="phoneNumber"
                      fullWidth
                      value={user.phoneNumber}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Country"
                      name="country"
                      fullWidth
                      value={user.country}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Grid>

                  {/* 🔐 PASSWORD UPDATE */}
                  {isEditing && (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          label="Old Password"
                          name="oldPassword"
                          type="password"
                          fullWidth
                          value={passwords.oldPassword}
                          onChange={handlePasswordChange}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          label="New Password"
                          name="newPassword"
                          type="password"
                          fullWidth
                          value={passwords.newPassword}
                          onChange={handlePasswordChange}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ProfileScreen;
