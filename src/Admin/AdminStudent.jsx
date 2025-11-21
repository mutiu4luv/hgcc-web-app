import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  CircularProgress,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  useMediaQuery,
  Rating,
  Alert,
  MenuItem,
} from "@mui/material";
import {
  Dashboard,
  AssignmentTurnedIn,
  UploadFile,
  Menu as MenuIcon,
  Close as CloseIcon,
  Logout,
  StarRate,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const drawerWidth = 250;

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [globalLoading, setGlobalLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [assignments, setAssignments] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  const [submissionTitle, setSubmissionTitle] = useState("");
  const [submissionFile, setSubmissionFile] = useState(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedCoach, setSelectedCoach] = useState("");

  const [mobileOpen, setMobileOpen] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [activeCohort, setActiveCohort] = useState(null);
  const [cohortLoading, setCohortLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("token");
  const isMobile = useMediaQuery("(max-width:900px)");

  const navigate = useNavigate();

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, key: "dashboard" },
    {
      text: "My Assignments",
      icon: <AssignmentTurnedIn />,
      key: "assignments",
    },
    { text: "Upload Submission", icon: <UploadFile />, key: "upload" },
    { text: "Rate Coach", icon: <StarRate />, key: "rate-coach" },
    {
      text: "Register Course",
      icon: <AssignmentTurnedIn />,
      key: "register-course",
    },
  ];

  // =========================
  // FETCH ASSIGNMENTS
  // =========================
  const loadAssignments = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/student/assignments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignments(res.data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load assignments");
    }
  };

  // =========================
  // FETCH SUBMISSIONS
  // =========================
  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/student/submissions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMySubmissions(res.data);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load submissions");
      }
    };

    loadSubmissions();
  }, []);
  // =========================
  // FETCH COACHES
  // =========================
  const loadCoaches = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/student/coaches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoaches(res.data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load coaches");
    }
  };

  // =========================
  // FETCH COURSES
  // =========================
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/course`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(res.data);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load courses");
      } finally {
        setGlobalLoading(false);
      }
    };

    loadCourses();
  }, []);

  // =========================
  // SUBMIT ASSIGNMENT
  // =========================
  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!submissionTitle || !submissionFile)
      return alert("Provide title and file");

    const formData = new FormData();
    formData.append("title", submissionTitle);
    formData.append("file", submissionFile);

    try {
      setGlobalLoading(true);
      await axios.post(`${BASE_URL}/api/student/upload-submission`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("✅ Submission uploaded successfully");
      setSubmissionTitle("");
      setSubmissionFile(null);
      loadSubmissions();
    } catch {
      setMessage("❌ Submission failed");
    } finally {
      setGlobalLoading(false);
    }
  };

  // =========================
  // SUBMIT FEEDBACK
  // =========================
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!selectedCoach || rating === 0)
      return alert("Select a coach and rating");

    try {
      setGlobalLoading(true);
      await axios.post(
        `${BASE_URL}/api/feedbacks`,
        {
          studentId: localStorage.getItem("userId"),
          coachId: selectedCoach,
          rating,
          comment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Feedback submitted successfully");
      setRating(0);
      setComment("");
      setSelectedCoach("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to submit feedback");
    } finally {
      setGlobalLoading(false);
    }
  };

  // =========================
  // REGISTER COURSE
  // =========================
  const handleRegisterCourse = async () => {
    if (!selectedCourse) return;
    try {
      setRegisterLoading(true);
      const res = await axios.post(
        `${BASE_URL}/api/student/register-course/${selectedCourse}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      setSelectedCourse("");
      loadCourses(); // refresh courses if needed
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to register course");
    } finally {
      setRegisterLoading(false);
    }
  };

  //laod active cohort

  useEffect(() => {
    const loadActiveCohort = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/cohort/active`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActiveCohort(res.data.cohort);
      } catch (err) {
        setActiveCohort(null); // no active cohort
      } finally {
        setCohortLoading(false);
      }
    };

    loadActiveCohort();
  }, [activeTab]);

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (globalLoading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={80} color="success" />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      {/* Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: drawerWidth,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#064e3b",
            color: "#fff",
            borderRight: "none",
          },
        }}
      >
        <Box sx={{ textAlign: "center", py: 3 }}>
          <Typography variant="h5" fontWeight="bold" color="#fff">
            Student Panel
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
        }}
      >
        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <Paper sx={{ p: 4 }}>
            <Typography variant="h4" color="green" fontWeight="bold">
              📊 Welcome to your Dashboard
            </Typography>
            <Typography sx={{ mt: 2 }}>
              Here you can view assignments, manage submissions, register
              courses, and rate coaches.
            </Typography>
          </Paper>
        )}

        {/* Upload Submission */}
        {activeTab === "upload" && (
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mt: 4 }}>
              📄 Submit Assignment
            </Typography>
            <form onSubmit={handleSubmitAssignment}>
              <TextField
                label="Submission Title"
                fullWidth
                sx={{ mb: 2 }}
                value={submissionTitle}
                onChange={(e) => setSubmissionTitle(e.target.value)}
              />
              <Button variant="contained" component="label" sx={{ mb: 2 }}>
                Choose File
                <input
                  type="file"
                  hidden
                  onChange={(e) => setSubmissionFile(e.target.files[0])}
                />
              </Button>
              <Button type="submit" variant="contained">
                Upload Submission
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
              🧾 My Assignments
            </Typography>
            <div style={{ height: 500, width: "100%" }}>
              <DataGrid
                rows={assignments.map((a) => ({ id: a._id, ...a }))}
                columns={[
                  { field: "title", headerName: "Assignment", width: 300 },
                  { field: "dueDate", headerName: "Due Date", width: 200 },
                  {
                    field: "status",
                    headerName: "Status",
                    width: 150,
                    renderCell: (params) => (
                      <Typography
                        color={
                          params.row.status === "pending" ? "red" : "green"
                        }
                      >
                        {params.row.status.charAt(0).toUpperCase() +
                          params.row.status.slice(1)}
                      </Typography>
                    ),
                  },
                ]}
                pageSize={5}
              />
            </div>
          </Paper>
        )}

        {/* Rate Coach */}
        {activeTab === "rate-coach" && (
          <Paper sx={{ p: 4 }}>
            <Typography variant="h4" color="green" fontWeight="bold">
              ⭐ Rate Your Coach
            </Typography>
            <form onSubmit={handleSubmitFeedback} style={{ marginTop: 20 }}>
              <TextField
                select
                label="Select Coach"
                value={selectedCoach}
                onChange={(e) => setSelectedCoach(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              >
                <MenuItem value="">-- Select Coach --</MenuItem>
                {coaches.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.fullName}
                  </MenuItem>
                ))}
              </TextField>
              <Typography>Rating:</Typography>
              <Rating
                value={rating}
                onChange={(e, newValue) => setRating(newValue)}
              />
              <TextField
                label="Comment"
                fullWidth
                multiline
                rows={3}
                sx={{ mt: 2, mb: 2 }}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button type="submit" variant="contained" color="success">
                Submit Feedback
              </Button>
            </form>
            {message && <Alert sx={{ mt: 2 }}>{message}</Alert>}
          </Paper>
        )}

        {/* Register Course */}
        {activeTab === "register-course" && (
          <Paper sx={{ p: 4 }}>
            {cohortLoading ? (
              <CircularProgress />
            ) : !activeCohort ? (
              <Typography variant="h5" color="red">
                ❌ No active cohort available
              </Typography>
            ) : (
              <>
                <Typography variant="h4" color="green" fontWeight="bold">
                  📝 Register to {activeCohort.name}
                </Typography>

                {registerLoading && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", my: 2 }}
                  >
                    <CircularProgress />
                  </Box>
                )}

                <Button
                  variant="contained"
                  color="success"
                  disabled={registerLoading}
                  onClick={() => handleRegisterStudent(activeCohort._id)}
                >
                  Register
                </Button>

                {message && <Alert sx={{ mt: 2 }}>{message}</Alert>}
              </>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default StudentDashboard;
