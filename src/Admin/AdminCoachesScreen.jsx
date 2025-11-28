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
  Grid,
  MenuItem,
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
  Delete,
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

  const [videoTitle, setVideoTitle] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videos, setVideos] = useState([]);

  const [docTitle, setDocTitle] = useState("");
  const [docFile, setDocFile] = useState(null);
  const [documents, setDocuments] = useState([]);

  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [ratingData, setRatingData] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true); // <-- ADD THIS
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [cohortId, setCohortId] = useState("");
  const [cohortCourses, setCohortCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [coachTitle, setCoachTitle] = useState("");

  const [coachDescription, setCoachDescription] = useState("");
  const [coachCourseId, setCoachCourseId] = useState("");
  const [coachDueDate, setCoachDueDate] = useState("");
  const [coachMessage, setCoachMessage] = useState("");

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("token");
  const isMobile = useMediaQuery("(max-width:900px)");

  const barColors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#6366f1"];

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, key: "dashboard" },
    { text: "Upload Video", icon: <UploadFile />, key: "upload-video" },
    { text: "Upload Document", icon: <UploadFile />, key: "upload-doc" },
    { text: "All Videos", icon: <UploadFile />, key: "videos" },
    { text: "All Documents", icon: <UploadFile />, key: "documents" },
    { text: "Assignments", icon: <AssignmentTurnedIn />, key: "assignments" },
    { text: "Students", icon: <School />, key: "students" },
    { text: "Live Mode", icon: <LiveTv />, key: "live" },
  ];

  // create cohort assignment
  const createCohortAssignmentUI = async () => {
    try {
      setCoachMessage("");

      if (!coachTitle || !coachCourseId) {
        setCoachMessage("Please enter a title and select a course.");
        return;
      }

      const payload = {
        cohortId,
        courseId: coachCourseId,
        title: coachTitle,
        description: coachDescription,
        dueDate: coachDueDate,
      };

      const res = await axios.post(`${BASE_URL}/api/assignment`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCoachMessage("Assignment created successfully!");

      // clear UI
      setCoachTitle("");
      setCoachDescription("");
      setCoachCourseId("");
      setCoachDueDate("");

      loadAssignments();
    } catch (err) {
      setCoachMessage(
        err.response?.data?.message || "Error creating assignment"
      );
    }
  };

  useEffect(() => {
    if (!cohortId) return;
    loadAssignments();
    loadCohortCourses();
  }, [cohortId]);

  useEffect(() => {
    // Fetch all cohorts for this coach
    const fetchCohorts = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/cohort/active-cohorts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.cohorts.length > 0) setCohortId(res.data.cohorts[0]._id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCohorts();
  }, []);
  useEffect(() => {
    if (!cohortId) return; // Prevent blank calls
    loadAssignments();
    loadCohortCourses();
  }, [cohortId]);
  // =========================
  // FETCH VIDEOS & DOCUMENTS
  // =========================
  const loadVideos = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/videos`);
      setVideos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadDocuments = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/coach/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadVideos();
    loadDocuments();
    setGlobalLoading(false);
  }, []);

  // =========================
  // VIDEO UPLOAD
  // =========================
  const handleVideoUpload = async (e) => {
    e.preventDefault();
    if (!videoTitle || !videoFile)
      return alert("Please provide title and video file");

    const formData = new FormData();
    formData.append("title", videoTitle);
    formData.append("file", videoFile);

    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/api/videos/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("🎥 Video uploaded successfully");
      setVideoTitle("");
      setVideoFile(null);
      loadVideos();
    } catch {
      setMessage("❌ Video upload failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (id) => {
    if (!window.confirm("Delete this video permanently?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/videos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideos(videos.filter((v) => v._id !== id));
    } catch {
      setMessage("❌ Failed to delete video");
    }
  };

  // =========================
  // DOCUMENT UPLOAD
  // =========================
  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!docTitle || !docFile)
      return alert("Please provide title and document file");

    const formData = new FormData();
    formData.append("title", docTitle);
    formData.append("file", docFile);

    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/api/coach/upload-document`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("📄 Document uploaded successfully");
      setDocTitle("");
      setDocFile(null);
      loadDocuments();
    } catch {
      setMessage("❌ Document upload failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id) => {
    if (!window.confirm("Delete this document permanently?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/coach/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocuments(documents.filter((d) => d._id !== id));
    } catch {
      setMessage("❌ Failed to delete document");
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // ========================= // FETCH ASSIGNMENTS // =========================

  const loadAssignments = async () => {
    setAssignmentsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/assignment/${cohortId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignments(res.data);
    } catch (err) {
      console.error("Error fetching assignments:", err?.response?.data || err);
      setMessage("Failed to load assignments");
    } finally {
      setAssignmentsLoading(false);
    }
  };

  // Create new assignment
  const createAssignment = async () => {
    if (!newTitle || !selectedCourseId) {
      setMessage("Title and Course are required");
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/api/assignment`,
        {
          cohortId,
          courseId: selectedCourseId,
          title: newTitle,
          description: newDescription,
          dueDate: newDueDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTitle("");
      setNewDescription("");
      setNewDueDate("");
      loadAssignments();
      setMessage("Assignment created successfully");
    } catch (err) {
      console.error("Error creating assignment:", err?.response?.data || err);
      setMessage("Failed to create assignment");
    }
  };

  // ========================= // FETCH STUDENTS // =========================
  useEffect(() => {
    const loadStudents = async () => {
      console.log("📡 Fetching students...");
      try {
        const res = await axios.get(`${BASE_URL}/api/coach/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("✅ Students response:", res.data);
        if (res.data.students) {
          setStudents(res.data.students);
        } else {
          console.warn("⚠ No 'students' field found in response");
        }
      } catch (err) {
        console.error(
          "❌ Error fetching students:",
          err?.response?.data || err
        );
        setMessage("Failed to load students");
      } finally {
        setStudentsLoading(false);
      }
    };
    loadStudents();
  }, [BASE_URL, token]);

  // ========================= // FETCH RATINGS // =========================
  useEffect(() => {
    const loadRatings = async () => {
      console.log("📡 Fetching ratings...");
      try {
        const res = await axios.get(`${BASE_URL}/api/feedbacks/my-ratings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("✅ Ratings raw:", res.data);
        const monthlyRatings = res.data.reduce((acc, item) => {
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
        console.log("📊 Processed rating data:", avgData);
        setRatingData(avgData);
      } catch (err) {
        console.error("❌ Error fetching ratings:", err?.response?.data || err);
        setMessage("Failed to load ratings");
      } finally {
        setGlobalLoading(false);
      }
    };
    loadRatings();
  }, [BASE_URL, token]);

  // Fetch courses in cohort
  const loadCohortCourses = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/cohort/${cohortId}/courses`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCohortCourses(res.data.courses || []);
    } catch (err) {
      console.error("Failed loading cohort courses:", err);
    }
  };

  useEffect(() => {
    loadAssignments();
    loadCohortCourses();
  }, [BASE_URL, token, cohortId]);

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
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#064e3b",
            color: "#fff",
            borderRight: "none",
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
                        <Cell key={i} fill={barColors[i % barColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        )}

        {/* Upload Video */}
        {activeTab === "upload-video" && (
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mt: 4 }}>
              🎥 Upload Video
            </Typography>
            <form onSubmit={handleVideoUpload}>
              <TextField
                label="Video Title"
                fullWidth
                sx={{ mb: 2 }}
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
              />
              <Button variant="contained" component="label" sx={{ mb: 2 }}>
                Choose Video
                <input
                  hidden
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                />
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Upload Video"}
              </Button>
            </form>
          </Paper>
        )}

        {/* Upload Document */}
        {activeTab === "upload-doc" && (
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mt: 4 }}>
              📄 Upload Document
            </Typography>
            <form onSubmit={handleDocumentUpload}>
              <TextField
                label="Document Title"
                fullWidth
                sx={{ mb: 2 }}
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
              />
              <Button variant="contained" component="label" sx={{ mb: 2 }}>
                Choose Document
                <input
                  hidden
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setDocFile(e.target.files[0])}
                />
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Upload Document"}
              </Button>
            </form>
          </Paper>
        )}

        {/* All Videos */}
        {activeTab === "videos" && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              📺 All Uploaded Videos
            </Typography>
            <Grid container spacing={3}>
              {videos.map((v) => (
                <Grid item xs={12} sm={6} md={4} key={v._id}>
                  <Paper sx={{ p: 2, position: "relative" }}>
                    <Typography fontWeight="bold">{v.title}</Typography>
                    <video
                      width="100%"
                      controls
                      style={{ marginTop: "10px", borderRadius: 8 }}
                    >
                      <source src={v.videoUrl} type="video/mp4" />
                    </video>
                    <IconButton
                      sx={{ position: "absolute", top: 5, right: 5 }}
                      onClick={() => deleteVideo(v._id)}
                    >
                      <Delete color="error" />
                    </IconButton>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* All Documents */}
        {activeTab === "documents" && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              📄 All Uploaded Documents
            </Typography>
            <Grid container spacing={3}>
              {documents.map((d) => (
                <Grid item xs={12} sm={6} md={4} key={d._id}>
                  <Paper sx={{ p: 2, position: "relative" }}>
                    <Typography fontWeight="bold">{d.title}</Typography>
                    <Typography variant="body2">
                      <a
                        href={d.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Document
                      </a>
                    </Typography>
                    <IconButton
                      sx={{ position: "absolute", top: 5, right: 5 }}
                      onClick={() => deleteDocument(d._id)}
                    >
                      <Delete color="error" />
                    </IconButton>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
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

            {/* Create Assignment Form */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 3,
                flexWrap: "wrap",
                alignItems: "center",
                "> .MuiTextField-root": { minWidth: 200, flex: 1 }, // ensure all fields have min width & expand
              }}
            >
              <TextField
                label="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <TextField
                label="Description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
              <TextField
                select
                label="Select Your Course"
                value={coachCourseId}
                onChange={(e) => setCoachCourseId(e.target.value)}
                fullWidth
              >
                {cohortCourses
                  ?.filter((c) => c.coachId?._id === user.id) // FIXED — compares ID to ID
                  .map((c) => (
                    <MenuItem key={c.courseId?._id} value={c.courseId?._id}>
                      {c.courseId?.name}
                    </MenuItem>
                  ))}
              </TextField>

              <TextField
                type="date"
                label="Due Date"
                InputLabelProps={{ shrink: true }}
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
              />
              <Button
                variant="contained"
                color="success"
                onClick={createAssignment}
              >
                Create Assignment
              </Button>
            </Box>

            {message && <Typography color="red">{message}</Typography>}

            {/* Loader or DataGrid */}
            {assignmentsLoading ? (
              <Box
                sx={{
                  height: 400,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress size={60} color="success" />
              </Box>
            ) : assignments.length === 0 ? (
              <Typography>No assignments available yet.</Typography>
            ) : (
              <div style={{ height: 500, width: "100%" }}>
                <DataGrid
                  rows={assignments.flatMap((a) =>
                    a.submissions.map((s) => ({
                      id: `${a._id}-${s.studentId?._id}`,
                      assignmentId: a._id,
                      studentId: s.studentId?._id,
                      studentName: s.studentId?.fullName || "N/A",
                      title: a.title,
                      status: s.grade ? "approved" : "pending",
                    }))
                  )}
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
                            onClick={() =>
                              approveAssignment(
                                params.row.assignmentId,
                                params.row.studentId
                              )
                            }
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
            )}
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

            {/* Loader */}
            {studentsLoading ? (
              <Box
                sx={{
                  height: 400,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress size={60} color="success" />
              </Box>
            ) : students.length === 0 ? (
              <Typography>No students enrolled in your courses yet.</Typography>
            ) : (
              <div style={{ height: 500, width: "100%" }}>
                <DataGrid
                  rows={students.map((s) => ({
                    id: s._id,
                    fullName: s.fullName,
                    email: s.email,
                    phoneNumber: s.phoneNumber,
                    progress: s.progress || "0%", // optional
                  }))}
                  columns={[
                    { field: "fullName", headerName: "Full Name", width: 250 },
                    { field: "email", headerName: "Email", width: 250 },
                    { field: "phoneNumber", headerName: "Phone", width: 180 },
                    { field: "progress", headerName: "Progress", width: 150 },
                  ]}
                  pageSize={5}
                />
              </div>
            )}
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
