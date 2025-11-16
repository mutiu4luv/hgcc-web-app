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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Chip,
  OutlinedInput,
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
  Legend,
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
  const [mobileOpen, setMobileOpen] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [analytics, setAnalytics] = useState({
    studentRegistrations: [],
    assignmentSubmissions: [],
    coachingSessions: [],
  });
  const [coachesList, setCoachesList] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState("");
  const [coachPerformance, setCoachPerformance] = useState([]);

  const [courseName, setCourseName] = useState("");
  const [courseCategory, setCourseCategory] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseDuration, setCourseDuration] = useState("");
  const [assignedCoach, setAssignedCoach] = useState(""); // optional
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [courses, setCourses] = useState([]);

  const [cohorts, setCohorts] = useState([]);
  const [cohortName, setCohortName] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]); // multiple courses
  const [selectedCoachForCohort, setSelectedCoachForCohort] = useState("");
  const [creatingCohort, setCreatingCohort] = useState(false);

  const isMobile = useMediaQuery("(max-width:900px)");
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    if (activeTab !== "create-cohort") return;

    const fetchCohorts = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/cohorts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCohorts(res.data);
      } catch (err) {
        setMessage("Failed to fetch cohorts");
      }
    };

    fetchCohorts();
  }, [activeTab, BASE_URL, token]);

  // 📤 Create Cohort
  const handleCreateCohort = async () => {
    if (!selectedCourses.length || !cohortName)
      return alert("Please fill all fields");

    if (!window.confirm("Are you sure you want to create this cohort?")) return;

    try {
      setCreatingCohort(true);
      const res = await axios.post(
        `${BASE_URL}/api/cohorts`,
        {
          name: cohortName,
          courseIds: selectedCourses, // send array
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message);
      setCohortName("");
      setSelectedCourses([]);
      setCohorts((prev) => [...prev, res.data.cohort]);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create cohort");
    } finally {
      setCreatingCohort(false);
    }
  };

  // 📤 Start Cohort
  const handleStartCohort = async (cohortId) => {
    if (!window.confirm("Are you sure you want to START this cohort?")) return;

    try {
      const res = await axios.put(
        `${BASE_URL}/api/cohorts/start/${cohortId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      setCohorts((prev) =>
        prev.map((c) =>
          c._id === cohortId ? { ...c, status: "in_progress" } : c
        )
      );
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to start cohort");
    }
  };

  const handleEndCohort = async (cohortId) => {
    if (!window.confirm("Are you sure you want to END this cohort?")) return;

    try {
      const res = await axios.put(
        `${BASE_URL}/api/cohorts/end/${cohortId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      setCohorts((prev) =>
        prev.map((c) =>
          c._id === cohortId ? { ...c, status: "completed" } : c
        )
      );
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to end cohort");
    }
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnalytics(res.data);
      } catch (err) {
        setMessage("Failed to load analytics");
      }
    };
    fetchAnalytics();
  }, []);

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
      setMessage(err.response?.data?.message || "Failed to delete user");
    }
  };

  // 🧑‍💼 Edit User
  const handleEditUser = (user) => {
    setEditUser(user);
    setEditModalOpen(true);
  };

  const handleEditUserSave = async () => {
    if (!editUser) return;
    try {
      await axios.put(`${BASE_URL}/api/users/${editUser._id}`, editUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.map((u) => (u._id === editUser._id ? editUser : u)));
      setMessage("User updated successfully");
      setEditModalOpen(false);
      setEditUser(null);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update user");
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
    { text: "Create Course", icon: <ManageAccounts />, key: "create-course" },
    { text: "All Courses", icon: <School />, key: "courses" },

    { text: "Manage Videos", icon: <VideoLibrary />, key: "videos" },
    { text: "Students", icon: <People />, key: "students" },
    { text: "Coaches", icon: <School />, key: "coaches" },
    { text: "Create Cohort", icon: <School />, key: "create-cohort" },
    { text: "Owner Tools", icon: <ManageAccounts />, key: "owner" },
  ];

  // 📊 Dummy chart data
  // const chartData = [
  //   { name: "Jan", users: 400, videos: 24 },
  //   { name: "Feb", users: 300, videos: 18 },
  //   { name: "Mar", users: 500, videos: 30 },
  //   { name: "Apr", users: 600, videos: 40 },
  // ];

  // chart data
  const chartData = analytics.studentRegistrations.map((item, idx) => ({
    month: item.month,
    students: item.count,
    assignments: analytics.assignmentSubmissions[idx]?.count || 0,
    coaching: analytics.coachingSessions[idx]?.count || 0,
  }));

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
            onClick={() => handleEditUser(params.row)}
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

  useEffect(() => {
    if (activeTab !== "courses") return;

    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/course`);
        setCourses(res.data);
      } catch (err) {
        setMessage("Failed to load courses");
      }
    };

    fetchCourses();
  }, [activeTab, BASE_URL]);

  // Fetch all coaches for dropdown
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/users/coaches`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // ✅ Only store the array of coaches
        setCoachesList(res.data.coaches || []);
      } catch (err) {
        console.error("Error fetching coaches:", err);
        setMessage("Failed to load coaches list");
        setCoachesList([]); // fallback to empty array
      }
    };
    fetchCoaches();
  }, [BASE_URL, token]);

  // Fetch selected coach performance
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const res = await axios.get("/api/coaches"); // your backend route for all coaches
        setCoachesList(res.data);
      } catch (err) {
        console.error("Error fetching coaches:", err);
      }
    };
    fetchCoaches();
  }, []);

  // 📊 Fetch monthly performance whenever coach changes
  useEffect(() => {
    if (!selectedCoach) return;
    const fetchPerformance = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${BASE_URL}/api/analytics/coach?coachId=${selectedCoach}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("✅ Coach performance:", res.data);

        setCoachPerformance(res.data);
      } catch (error) {
        console.error("❌ Error fetching coach performance:", error);

        setCoachPerformance([]);
      } finally {
        setLoading(false);
      }
    };

    // Add all used variables (BASE_URL, token) to the dependency array
    fetchPerformance();
  }, [selectedCoach, BASE_URL, token]);

  const barColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  // Ensure coachesList is always an array
  const safeCoachesList = Array.isArray(coachesList) ? coachesList : [];

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
        {/* Edit Modal */}
        {editModalOpen && editUser && (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              bgcolor: "rgba(0,0,0,0.3)",
              zIndex: 2000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Paper sx={{ p: 4, minWidth: 320 }}>
              <Typography variant="h6" gutterBottom>
                Edit User
              </Typography>
              <TextField
                label="Full Name"
                fullWidth
                sx={{ mb: 2 }}
                value={editUser.fullName}
                onChange={(e) =>
                  setEditUser({ ...editUser, fullName: e.target.value })
                }
              />
              <TextField
                label="Email"
                fullWidth
                sx={{ mb: 2 }}
                value={editUser.email}
                onChange={(e) =>
                  setEditUser({ ...editUser, email: e.target.value })
                }
              />
              <TextField
                label="Phone Number"
                fullWidth
                sx={{ mb: 2 }}
                value={editUser.phoneNumber}
                onChange={(e) =>
                  setEditUser({ ...editUser, phoneNumber: e.target.value })
                }
              />
              <TextField
                label="Role"
                select
                SelectProps={{ native: true }}
                fullWidth
                sx={{ mb: 2 }}
                value={editUser.role}
                onChange={(e) =>
                  setEditUser({ ...editUser, role: e.target.value })
                }
              >
                <option value="">-- Select Role --</option>
                <option value="student">Student</option>
                <option value="coach">Coach</option>
              </TextField>
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleEditUserSave}
                  sx={{ bgcolor: "#10b981", color: "white" }}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditUser(null);
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
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

              <Box sx={{ my: 3 }}>
                <Typography variant="h6" fontWeight="bold" color="green">
                  Select Coach to View Monthly Performance
                </Typography>

                <TextField
                  select
                  SelectProps={{ native: true }}
                  fullWidth
                  value={selectedCoach}
                  onChange={(e) => setSelectedCoach(e.target.value)}
                  sx={{ mt: 1, mb: 3 }}
                >
                  <option value="">-- Select a Coach --</option>
                  {coachesList.map((coach) => (
                    <option key={coach._id} value={coach._id}>
                      {coach.fullName}
                    </option>
                  ))}
                </TextField>

                {loading ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", my: 4 }}
                  >
                    <CircularProgress />
                  </Box>
                ) : selectedCoach && coachPerformance.length > 0 ? (
                  <Box sx={{ width: "100%", height: 400 }}>
                    <ResponsiveContainer>
                      <BarChart data={coachPerformance}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="sessions"
                          fill="#3b82f6"
                          name="Sessions"
                        />
                        <Bar
                          dataKey="studentsTaught"
                          fill="#10b981"
                          name="Students Taught"
                        />
                        <Bar
                          dataKey="assignmentsReviewed"
                          fill="#f59e0b"
                          name="Assignments Reviewed"
                        />
                        <Bar
                          dataKey="avgRating"
                          fill="#ef4444"
                          name="Avg Rating"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  selectedCoach && (
                    <Typography sx={{ textAlign: "center", color: "gray" }}>
                      No performance data available for this coach yet.
                    </Typography>
                  )
                )}
              </Box>
            </Paper>
          </Container>
        )}
        {/* === Create Course === */}
        {activeTab === "create-course" && (
          <Container>
            <Paper sx={{ p: 4, borderRadius: 4, mb: 4 }}>
              <Typography
                variant="h4"
                color="green"
                fontWeight="bold"
                gutterBottom
              >
                🧠 Owner Control Panel
              </Typography>

              <Typography sx={{ mb: 3 }}>Create a new course</Typography>

              {message && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  {message}
                </Alert>
              )}

              <TextField
                label="Course Name"
                fullWidth
                sx={{ mb: 2 }}
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
              />
              <TextField
                label="Category"
                fullWidth
                sx={{ mb: 2 }}
                value={courseCategory}
                onChange={(e) => setCourseCategory(e.target.value)}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={4}
                sx={{ mb: 2 }}
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
              />
              <TextField
                select
                SelectProps={{ native: true }}
                fullWidth
                sx={{ mb: 2 }}
                value={courseDuration}
                required
                onChange={(e) => setCourseDuration(e.target.value)}
              >
                <option value="">-- Select Duration --</option>
                <option value="1-month">1 Month</option>
                <option value="3-months">3 Months</option>
                <option value="6-months">6 Months</option>
              </TextField>
              <TextField
                select
                SelectProps={{ native: true }}
                fullWidth
                sx={{ mb: 2 }}
                value={assignedCoach}
                onChange={(e) => setAssignedCoach(e.target.value)}
                required
              >
                <option value="">-- Assign Coach --</option>
                {safeCoachesList.map((coach) => (
                  <option key={coach._id} value={coach._id}>
                    {coach.fullName}
                  </option>
                ))}
              </TextField>

              <Button
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: "#10b981",
                  color: "white",
                  fontWeight: "bold",
                  "&:hover": { bgcolor: "#047857" },
                }}
                onClick={async () => {
                  if (!courseName || !courseDuration)
                    return alert("Name and duration are required");

                  setCreatingCourse(true);
                  try {
                    const res = await axios.post(
                      `${BASE_URL}/api/course`,
                      {
                        name: courseName,
                        category: courseCategory,
                        description: courseDescription,
                        coachId: assignedCoach,
                        duration: courseDuration,
                      },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );

                    setMessage(res.data.message);
                    // Clear form
                    setCourseName("");
                    setCourseCategory("");
                    setCourseDescription("");
                    setCourseDuration("");
                    setAssignedCoach("");
                  } catch (err) {
                    setMessage(
                      err.response?.data?.message || "Failed to create course"
                    );
                  } finally {
                    setCreatingCourse(false);
                  }
                }}
              >
                {creatingCourse ? (
                  <CircularProgress size={24} />
                ) : (
                  "Create Course"
                )}
              </Button>
            </Paper>
          </Container>
        )}
        {/* === All Courses === */}
        {activeTab === "courses" && (
          <Container>
            <Paper sx={{ p: 4, borderRadius: 4 }}>
              <Typography
                variant="h4"
                color="green"
                fontWeight="bold"
                gutterBottom
              >
                📚 All Courses
              </Typography>

              {message && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  {message}
                </Alert>
              )}

              <Grid container spacing={2}>
                {courses.length === 0 ? (
                  <Typography
                    sx={{ textAlign: "center", width: "100%", color: "gray" }}
                  >
                    No courses available.
                  </Typography>
                ) : (
                  courses.map((course) => (
                    <Grid item xs={12} md={6} key={course._id}>
                      <Card sx={{ p: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                          {course.name}
                        </Typography>
                        <Typography color="gray">{course.category}</Typography>
                        <Typography>{course.description}</Typography>
                        <Typography sx={{ mt: 1 }}>
                          Coach: {course.coach?.fullName || "Not assigned"}
                        </Typography>
                        <Typography>Duration: {course.duration}</Typography>

                        <Button
                          variant="contained"
                          color="error"
                          sx={{ mt: 2 }}
                          onClick={async () => {
                            if (
                              !window.confirm(
                                "Are you sure you want to delete this course?"
                              )
                            )
                              return;

                            try {
                              const res = await axios.delete(
                                `${BASE_URL}/api/course/${course._id}`,
                                {
                                  headers: { Authorization: `Bearer ${token}` },
                                }
                              );

                              // Update state safely
                              setCourses((prevCourses) =>
                                prevCourses.filter((c) => c._id !== course._id)
                              );

                              setMessage(
                                res.data?.message ||
                                  "Course deleted successfully"
                              );
                            } catch (err) {
                              console.error("Delete course error:", err);
                              setMessage(
                                err.response?.data?.message ||
                                  "Failed to delete course"
                              );
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
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
        // === Create Cohort ===
        {activeTab === "create-cohort" && (
          <Container>
            <Paper sx={{ p: 4, borderRadius: 4 }}>
              <Typography
                variant="h4"
                color="green"
                fontWeight="bold"
                gutterBottom
              >
                🏫 Create Cohort
              </Typography>

              {message && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  {message}
                </Alert>
              )}

              <TextField
                label="Cohort Name"
                fullWidth
                sx={{ mb: 2 }}
                value={cohortName}
                onChange={(e) => setCohortName(e.target.value)}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="courses-label">Select Courses</InputLabel>
                <Select
                  labelId="courses-label"
                  multiple
                  value={selectedCourses}
                  onChange={(e) => setSelectedCourses(e.target.value)}
                  input={<OutlinedInput label="Select Courses" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((id) => {
                        const course = courses.find((c) => c._id === id);
                        return (
                          <Chip key={id} label={course?.name || "Unknown"} />
                        );
                      })}
                    </Box>
                  )}
                >
                  {courses.map((course) => (
                    <MenuItem key={course._id} value={course._id}>
                      {course.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                select
                SelectProps={{ native: true }}
                fullWidth
                sx={{ mb: 2 }}
                value={selectedCoachForCohort}
                onChange={(e) => setSelectedCoachForCohort(e.target.value)}
              >
                <option value="">-- Select Coach --</option>
                {safeCoachesList.map((coach) => (
                  <option key={coach._id} value={coach._id}>
                    {coach.fullName}
                  </option>
                ))}
              </TextField>

              <Button
                variant="contained"
                fullWidth
                sx={{ bgcolor: "#10b981", color: "white", mb: 4 }}
                onClick={handleCreateCohort}
              >
                {creatingCohort ? (
                  <CircularProgress size={24} />
                ) : (
                  "Create Cohort"
                )}
              </Button>

              <Typography variant="h5" sx={{ mb: 2 }}>
                ⚡ Manage Cohorts
              </Typography>

              {cohorts.length === 0 ? (
                <Typography>No cohorts available.</Typography>
              ) : (
                cohorts.map((cohort) => (
                  <Card key={cohort._id} sx={{ p: 2, mb: 2 }}>
                    <Typography>
                      <strong>{cohort.name}</strong> - Course:{" "}
                      {cohort.course?.name || "Unknown"} - Status:{" "}
                      {cohort.status}
                    </Typography>

                    <Box sx={{ mt: 1, display: "flex", gap: 2 }}>
                      <Button
                        variant="contained"
                        color="success"
                        disabled={cohort.status !== "not_started"}
                        onClick={() => handleStartCohort(cohort._id)}
                      >
                        Start Cohort
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        disabled={cohort.status !== "in_progress"}
                        onClick={() => handleEndCohort(cohort._id)}
                      >
                        End Cohort
                      </Button>
                    </Box>
                  </Card>
                ))
              )}
            </Paper>
          </Container>
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
