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
  IconButton,
  useMediaQuery,
} from "@mui/material";
import {
  Dashboard,
  VideoLibrary,
  People,
  School,
  Logout,
  Edit,
  Delete,
  Notifications,
  Email,
  ManageAccounts,
  Menu as MenuIcon,
  Close as CloseIcon,
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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  const isMobile = useMediaQuery("(max-width:900px)");
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // 📥 Fetch Videos
  const fetchVideos = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/videos`);
      setVideos(res.data);
    } catch {
      setMessage("Failed to load videos");
    }
  };

  // 📥 Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Fetch users failed:", err);
      setMessage("Failed to load users");
    }
  };

  // ⏳ Global loader
  useEffect(() => {
    const loadAll = async () => {
      setGlobalLoading(true);
      try {
        await Promise.all([fetchVideos(), fetchUsers()]);
      } finally {
        setTimeout(() => setGlobalLoading(false), 800);
      }
    };
    loadAll();
  }, []);

  // 📤 Upload Video
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

  // 🗑 Delete Video
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

  // 🧑‍💼 Delete User
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u._id !== id));
      setMessage("User deleted successfully");
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete user");
    }
  };

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // 🧭 Sidebar items
  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, key: "dashboard" },
    { text: "Manage Videos", icon: <VideoLibrary />, key: "videos" },
    { text: "Students", icon: <People />, key: "students" },
    { text: "Coaches", icon: <School />, key: "coaches" },
    { text: "Owner Tools", icon: <ManageAccounts />, key: "owner" },
  ];

  // 📊 Dummy chart data
  const chartData = [
    { name: "Jan", users: 400, videos: 24 },
    { name: "Feb", users: 300, videos: 18 },
    { name: "Mar", users: 500, videos: 30 },
    { name: "Apr", users: 600, videos: 40 },
  ];

  // 🧑‍🎓 Filter users
  const students = Array.isArray(users)
    ? users.filter((u) => u.role === "student")
    : [];
  const coaches = Array.isArray(users)
    ? users.filter((u) => u.role === "coach")
    : [];

  const commonColumns = [
    { field: "fullName", headerName: "Full Name", width: 300 }, // fixed width for long names
    { field: "email", headerName: "Email", width: 350 }, // fixed width for long emails
    { field: "phoneNumber", headerName: "Phone Number", width: 200 },
    { field: "role", headerName: "Role", width: 140 }, // fixed (not shrinkable)
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <>
          <IconButton
            sx={{ color: "white", bgcolor: "#15803d", mr: 1 }}
            onClick={() => alert("Edit user feature coming soon")}
          >
            <Edit />
          </IconButton>
          <IconButton
            sx={{ color: "white", bgcolor: "#b91c1c" }}
            onClick={() => handleDeleteUser(params.row._id)}
          >
            <Delete />
          </IconButton>
        </>
      ),
    },
  ];

  // 🌀 Global Loader
  if (globalLoading) {
    return (
      <Box
        sx={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f0fdf4",
        }}
      >
        <CircularProgress size={80} thickness={5} color="success" />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
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
        <Box
          sx={{
            textAlign: "center",
            py: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography variant="h5" fontWeight="bold" color="#10b981">
            HGSC² Admin
          </Typography>
          {isMobile && (
            <IconButton
              onClick={() => setMobileOpen(false)}
              sx={{ color: "white" }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>

        <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.key}
              selected={activeTab === item.key}
              onClick={() => {
                setActiveTab(item.key);
                if (isMobile) setMobileOpen(false); // collapse on mobile
              }}
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
            <Logout sx={{ color: "#fff" }} />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ sx: { color: "#fff", fontWeight: 500 } }}
          />
        </ListItemButton>
      </Drawer>

      {/* Toggle Button for Mobile */}
      {isMobile && !mobileOpen && (
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            bgcolor: "#10b981",
            color: "white",
            zIndex: 1300,
            "&:hover": { bgcolor: "#047857" },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          bgcolor: "#f0fdf4",
          p: { xs: 2, md: 4 },
          width: isMobile && !mobileOpen ? "100%" : "auto",
        }}
      >
        {/* === Dashboard === */}
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

        {/* === Manage Videos === */}
        {activeTab === "videos" && (
          <Container maxWidth="md">
            <Paper
              elevation={8}
              component={motion.div}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              sx={{ p: 4, borderRadius: 4, background: "#fff" }}
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
                    color: "white",
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
                  fullWidth
                  disabled={loading}
                  sx={{
                    bgcolor: "#10b981",
                    color: "white",
                    fontWeight: "bold",
                    "&:hover": { bgcolor: "#047857" },
                  }}
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
                          onClick={() => deleteVideo(v._id)}
                          sx={{
                            mt: 1,
                            bgcolor: "#b91c1c",
                            color: "white",
                            fontWeight: "bold",
                            "&:hover": {
                              bgcolor: "#991b1b",
                            },
                          }}
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

        {/* === Students Table === */}
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
            <div style={{ height: 500, width: "100%" }}>
              <DataGrid
                rows={students.map((s) => ({ id: s._id, ...s }))}
                columns={commonColumns}
                pageSize={5}
              />
            </div>
          </Paper>
        )}

        {/* === Coaches Table === */}
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
            <div style={{ height: 500, width: "100%" }}>
              <DataGrid
                rows={coaches.map((c) => ({ id: c._id, ...c }))}
                columns={commonColumns}
                pageSize={5}
              />
            </div>
          </Paper>
        )}

        {/* === Owner Tools === */}
        {activeTab === "owner" && (
          <Container>
            <Paper sx={{ p: 4, borderRadius: 4 }}>
              <Typography
                variant="h4"
                color="green"
                fontWeight="bold"
                gutterBottom
              >
                🧠 Owner Control Panel
              </Typography>
              <Typography sx={{ mb: 3 }}>
                Manage notifications, send broadcast emails, or perform
                maintenance.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      bgcolor: "#10b981",
                      color: "white",
                      fontWeight: "bold",
                      py: 2,
                      "&:hover": { bgcolor: "#047857" },
                    }}
                    startIcon={<Email />}
                    onClick={() => alert("Email broadcast tool coming soon")}
                  >
                    Send Broadcast Email
                  </Button>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      bgcolor: "#f59e0b",
                      color: "white",
                      fontWeight: "bold",
                      py: 2,
                      "&:hover": { bgcolor: "#d97706" },
                    }}
                    startIcon={<Notifications />}
                    onClick={() =>
                      alert("Push notification feature coming soon")
                    }
                  >
                    Send Notification
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Container>
        )}
      </Box>
    </Box>
  );
};

export default AdminOwner;
