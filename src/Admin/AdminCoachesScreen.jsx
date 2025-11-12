import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  CircularProgress,
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
  UploadFile,
  AssignmentTurnedIn,
  School,
  Logout,
  Menu as MenuIcon,
  Close as CloseIcon,
  CheckCircle,
  LiveTv,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";

const drawerWidth = 250;

const CoachDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [video, setVideo] = useState(null);
  const [document, setDocument] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [ratingData, setRatingData] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const isMobile = useMediaQuery("(max-width:900px)");

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, key: "dashboard" },
    { text: "Upload Materials", icon: <UploadFile />, key: "upload" },
    { text: "Assignments", icon: <AssignmentTurnedIn />, key: "assignments" },
    { text: "Students", icon: <School />, key: "students" },
    { text: "Live Mode", icon: <LiveTv />, key: "live" }, // ✅ NEW
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignRes, studentRes, ratingRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/coach/assignments`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/coach/students`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/feedbacks/coaches-ratings`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const monthlyRatings = ratingRes.data.reduce((acc, item) => {
          const month = new Date(item.createdAt).toLocaleString("default", {
            month: "short",
          });
          if (!acc[month]) acc[month] = [];
          acc[month].push(item.rating);
          return acc;
        }, {});

        const avgData = Object.keys(monthlyRatings).map((month) => ({
          month,
          averageRating:
            monthlyRatings[month].reduce((a, b) => a + b, 0) /
            monthlyRatings[month].length,
        }));

        setAssignments(assignRes.data);
        setStudents(studentRes.data);
        setRatingData(avgData);
      } catch (err) {
        console.error("❌ Error loading coach data:", err);
        setMessage("Failed to load data");
      } finally {
        setGlobalLoading(false);
      }
    };
    fetchData();
  }, [BASE_URL, token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleVideoUpload = async (e) => {
    e.preventDefault();
    if (!title || !video) return alert("Please provide title and video file");
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", video);
    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/api/coach/upload-video`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("✅ Video uploaded successfully");
      setTitle("");
      setVideo(null);
    } catch {
      setMessage("❌ Video upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!title || !document)
      return alert("Please provide title and document file");
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", document);
    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/api/coach/upload-document`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("✅ Document uploaded successfully");
      setTitle("");
      setDocument(null);
    } catch {
      setMessage("❌ Document upload failed");
    } finally {
      setLoading(false);
    }
  };

  const approveAssignment = async (id) => {
    try {
      await axios.put(
        `${BASE_URL}/api/coach/assignments/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAssignments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: "approved" } : a))
      );
      setMessage("✅ Assignment approved");
    } catch {
      setMessage("❌ Failed to approve assignment");
    }
  };

  const barColors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#6366f1"];

  if (globalLoading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f0fdf4",
        }}
      >
        <CircularProgress size={80} color="success" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#f0fdf4",
        width: "100%",
      }}
    >
      {/* Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          zIndex: 1200,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#064e3b",
            color: "#fff",
            borderRight: "none",
            zIndex: 1201,
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
          }}
        >
          <Typography variant="h5" fontWeight="bold" color="#fff">
            Coach Panel
          </Typography>
          {isMobile && (
            <IconButton
              onClick={() => setMobileOpen(false)}
              sx={{ color: "#fff" }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        <Divider sx={{ bgcolor: "rgba(255,255,255,0.3)" }} />
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.key}
              selected={activeTab === item.key}
              onClick={() => {
                setActiveTab(item.key);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                "&.Mui-selected": {
                  bgcolor: "#10b981",
                  "& .MuiListItemText-primary": { color: "#fff" },
                },
                "&:hover": { bgcolor: "#047857" },
              }}
            >
              <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ color: "#fff" }}
              />
            </ListItemButton>
          ))}
        </List>
        <Divider sx={{ bgcolor: "rgba(255,255,255,0.3)" }} />
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon sx={{ color: "#fff" }}>
            <Logout />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ color: "#fff" }}
          />
        </ListItemButton>
      </Drawer>

      {/* Mobile Menu Button */}
      {isMobile && !mobileOpen && (
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            bgcolor: "#10b981",
            color: "#fff",
            "&:hover": { bgcolor: "#047857" },
            zIndex: 1300,
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          ml: isMobile ? 0 : `${drawerWidth}px`,
          p: { xs: 2, md: 4 },
          overflowY: "auto",
          height: "100vh",
        }}
      >
        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <Paper sx={{ p: 4 }}>
            <Typography
              variant="h4"
              color="green"
              fontWeight="bold"
              gutterBottom
            >
              📊 Monthly Rating Overview
            </Typography>
            {ratingData.length === 0 ? (
              <Typography>No rating data available yet.</Typography>
            ) : (
              <Box sx={{ width: "100%", height: 400 }}>
                <ResponsiveContainer>
                  <BarChart data={ratingData}>
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="averageRating" name="Average Rating">
                      {ratingData.map((_, i) => (
                        <Cell
                          key={`cell-${i}`}
                          fill={barColors[i % barColors.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        )}

        {/* Upload */}
        {activeTab === "upload" && (
          <Paper sx={{ p: 4 }}>
            <Typography
              variant="h4"
              color="green"
              fontWeight="bold"
              gutterBottom
            >
              📤 Upload Training Materials
            </Typography>
            {message && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}
            <Typography variant="h6" sx={{ mt: 2 }}>
              🎥 Upload Video
            </Typography>
            <form onSubmit={handleVideoUpload}>
              <TextField
                label="Title"
                fullWidth
                sx={{ mb: 2 }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Button
                variant="contained"
                component="label"
                sx={{ mb: 2, bgcolor: "#15803d" }}
              >
                Choose Document
                <input
                  hidden
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => setDocument(e.target.files[0])}
                />
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{ bgcolor: "#10b981" }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Upload"}
              </Button>
            </form>
          </Paper>
        )}

        {/* Assignments */}
        {activeTab === "assignments" && (
          <Paper sx={{ p: 4 }}>
            <Typography
              variant="h4"
              color="green"
              fontWeight="bold"
              gutterBottom
            >
              🧾 Student Assignments
            </Typography>
            <div style={{ height: 500, width: "100%" }}>
              <DataGrid
                rows={assignments.map((a) => ({ id: a._id, ...a }))}
                columns={[
                  { field: "studentName", headerName: "Student", width: 250 },
                  { field: "title", headerName: "Assignment", width: 300 },
                  { field: "status", headerName: "Status", width: 150 },
                  {
                    field: "actions",
                    headerName: "Actions",
                    width: 180,
                    renderCell: (params) =>
                      params.row.status === "pending" ? (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<CheckCircle />}
                          onClick={() => approveAssignment(params.row._id)}
                          sx={{ bgcolor: "#10b981" }}
                        >
                          Approve
                        </Button>
                      ) : (
                        <Typography color="green">Approved</Typography>
                      ),
                  },
                ]}
                pageSize={5}
              />
            </div>
          </Paper>
        )}

        {/* Students */}
        {activeTab === "students" && (
          <Paper sx={{ p: 4 }}>
            <Typography
              variant="h4"
              color="green"
              fontWeight="bold"
              gutterBottom
            >
              👩‍🎓 My Students ({students.length})
            </Typography>
            <div style={{ height: 500, width: "100%" }}>
              <DataGrid
                rows={students.map((s) => ({ id: s._id, ...s }))}
                columns={[
                  { field: "fullName", headerName: "Full Name", width: 300 },
                  { field: "email", headerName: "Email", width: 300 },
                  { field: "progress", headerName: "Progress", width: 150 },
                ]}
                pageSize={5}
              />
            </div>
          </Paper>
        )}

        {/* ✅ Live Mode */}
        {activeTab === "live" && (
          <Paper sx={{ p: 4 }}>
            <Typography
              variant="h4"
              color="green"
              fontWeight="bold"
              gutterBottom
            >
              🔴 Live Mode
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Welcome to <strong>Live Mode</strong>. Here you can host live
              coaching sessions, interact with students in real time, and manage
              ongoing sessions.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 3, bgcolor: "#10b981" }}
              onClick={() => alert("Launching Live Session...")}
            >
              Go Live
            </Button>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default CoachDashboard;
