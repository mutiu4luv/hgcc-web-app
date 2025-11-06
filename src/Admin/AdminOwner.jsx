// src/admin/AdminOwner.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  TextField,
  CircularProgress,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Alert,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Dashboard,
  VideoLibrary,
  People,
  School,
  Logout,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import axios from "axios";

const AdminOwner = () => {
  const [title, setTitle] = useState("");
  const [video, setVideo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // 📥 Fetch videos
  const fetchVideos = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/videos`);
      setVideos(res.data);
    } catch {
      setMessage("Failed to load videos");
    }
  };

  useEffect(() => {
    if (activeTab === "videos") fetchVideos();
  }, [activeTab]);

  // 📤 Upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !video) return alert("All fields are required");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("video", video);

    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/api/videos/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage(res.data.message);
      fetchVideos();
      setTitle("");
      setVideo(null);
    } catch (err) {
      setMessage(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // 🗑 Delete video
  const deleteVideo = async (id) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/videos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideos(videos.filter((v) => v._id !== id));
      setMessage("Video deleted");
    } catch {
      setMessage("Delete failed");
    }
  };

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // 🧭 Sidebar
  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, key: "dashboard" },
    { text: "Manage Videos", icon: <VideoLibrary />, key: "videos" },
    { text: "Students", icon: <People />, key: "students" },
    { text: "Coaches", icon: <School />, key: "coaches" },
  ];

  // 🧮 Fake analytics
  const chartData = [
    { name: "Jan", users: 400, videos: 24 },
    { name: "Feb", users: 300, videos: 18 },
    { name: "Mar", users: 500, videos: 30 },
    { name: "Apr", users: 600, videos: 40 },
  ];

  // 📊 Sample Students & Coaches
  const studentRows = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      course: "HTML Basics",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      course: "React Advanced",
    },
  ];
  const coachRows = [
    { id: 1, name: "Coach Ben", email: "ben@coach.com", expertise: "Frontend" },
    {
      id: 2,
      name: "Coach Lisa",
      email: "lisa@coach.com",
      expertise: "Backend",
    },
  ];

  const studentCols = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "course", headerName: "Course", flex: 1 },
  ];

  const coachCols = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "expertise", headerName: "Expertise", flex: 1 },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 250,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 250,
            boxSizing: "border-box",
            backgroundColor: "#064e3b",
            color: "#fff",
          },
        }}
      >
        <Box sx={{ textAlign: "center", py: 3 }}>
          <Typography variant="h5" fontWeight="bold" color="#10b981">
            HGSC² Admin
          </Typography>
        </Box>
        <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.key}
              selected={activeTab === item.key}
              onClick={() => setActiveTab(item.key)}
              sx={{
                color: "#fff",
                "&.Mui-selected": {
                  backgroundColor: "#10b981",
                  color: "#fff",
                },
                "&:hover": { backgroundColor: "#047857" },
              }}
            >
              <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ sx: { color: "#fff" } }}
              />
            </ListItemButton>
          ))}
        </List>
        <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
        <ListItemButton onClick={handleLogout} sx={{ color: "#fff" }}>
          <ListItemIcon sx={{ color: "#fff" }}>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, bgcolor: "#f0fdf4", p: 4 }}>
        {/* Dashboard Section */}
        {activeTab === "dashboard" && (
          <Container>
            <Paper sx={{ p: 4, borderRadius: 4 }}>
              <Typography
                variant="h4"
                color="green"
                fontWeight="bold"
                gutterBottom
              >
                📊 Dashboard Analytics
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#3b82f6" />
                  <Bar dataKey="videos" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Container>
        )}

        {/* Video Management */}
        {activeTab === "videos" && (
          <Container maxWidth="md">
            <Paper
              elevation={8}
              component={motion.div}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              sx={{
                p: 4,
                borderRadius: 4,
                background: "#fff",
              }}
            >
              <Typography
                variant="h4"
                textAlign="center"
                fontWeight="bold"
                gutterBottom
                color="green"
              >
                🎬 Manage Testimonial Videos
              </Typography>

              {message && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  {message}
                </Alert>
              )}

              <form onSubmit={handleUpload}>
                <TextField
                  label="Video Title"
                  variant="outlined"
                  fullWidth
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Button
                  variant="contained"
                  component="label"
                  fullWidth
                  sx={{
                    backgroundColor: "#14532d",
                    fontWeight: "bold",
                    mb: 2,
                    "&:hover": { backgroundColor: "#15803d" },
                  }}
                >
                  Choose Video
                  <input
                    hidden
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideo(e.target.files[0])}
                  />
                </Button>

                {video && (
                  <Typography textAlign="center" sx={{ mb: 1 }}>
                    Selected: {video.name}
                  </Typography>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Upload Video"}
                </Button>
              </form>

              <Typography variant="h5" sx={{ mt: 5, mb: 2 }}>
                📁 Uploaded Videos
              </Typography>

              <Grid container spacing={3}>
                {videos.map((v) => (
                  <Grid item xs={12} md={6} key={v._id}>
                    <Card sx={{ bgcolor: "#f9fafb" }}>
                      <CardMedia
                        component="video"
                        controls
                        src={v.videoUrl}
                        height="200"
                      />
                      <CardContent>
                        <Typography>{v.title}</Typography>
                        <Button
                          color="error"
                          onClick={() => deleteVideo(v._id)}
                          sx={{ mt: 1 }}
                        >
                          Delete
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Container>
        )}

        {/* Students Table */}
        {activeTab === "students" && (
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="h4"
              color="green"
              fontWeight="bold"
              gutterBottom
            >
              👨‍🎓 Students
            </Typography>
            <div style={{ height: 400, width: "100%" }}>
              <DataGrid rows={studentRows} columns={studentCols} pageSize={5} />
            </div>
          </Paper>
        )}

        {/* Coaches Table */}
        {activeTab === "coaches" && (
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="h4"
              color="green"
              fontWeight="bold"
              gutterBottom
            >
              🧑‍🏫 Coaches
            </Typography>
            <div style={{ height: 400, width: "100%" }}>
              <DataGrid rows={coachRows} columns={coachCols} pageSize={5} />
            </div>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default AdminOwner;
