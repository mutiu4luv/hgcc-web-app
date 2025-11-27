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
  Modal,
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
  const [activeCohorts, setActiveCohorts] = useState([]);
  const [selectedCohort, setSelectedCohort] = useState("");
  const [cohortLoading, setCohortLoading] = useState(true);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

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
      const res = await axios.get(`${BASE_URL}/api/coach/coaches`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Coaches:", res.data.coaches);

      setCoaches(res.data.coaches); // FIXED
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
        const res = await axios.get(`${BASE_URL}/api/course?ts=${Date.now()}`, {
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
    loadCoaches();
    loadAssignments();
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
      loadAssignments();
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

    if (!selectedCoach || rating === 0) {
      return alert("Select a coach and rating");
    }

    try {
      setGlobalLoading(true);

      // ✅ Get studentId from stored user object
      const user = JSON.parse(localStorage.getItem("user"));
      const studentId = user?.id;
      if (!studentId) throw new Error("User ID not found");

      await axios.post(
        `${BASE_URL}/api/feedbacks`,
        {
          studentId,
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
  // ACTIVE COHORT
  // =========================
  useEffect(() => {
    const loadActiveCohorts = async () => {
      try {
        setCohortLoading(true);
        const res = await axios.get(`${BASE_URL}/api/cohort/assigned`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActiveCohorts(res.data.cohorts || []);
      } catch (err) {
        console.error(err);
        setActiveCohorts([]);
      } finally {
        setCohortLoading(false);
      }
    };
    loadActiveCohorts();
  }, []);

  // =========================
  // REGISTER STUDENT
  // =========================
  const handleRegisterStudent = async (cohortId, courseId) => {
    try {
      setRegisterLoading(true);
      const res = await axios.post(
        `${BASE_URL}/api/cohort/student/register-cohort/${cohortId}`,
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      setSuccessModalOpen(true);
      setTimeout(() => navigate(`/payment/${cohortId}/${courseId}`), 5000);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to register");
    } finally {
      setRegisterLoading(false);
    }
  };

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
          <Paper sx={{ p: 4, mb: 4 }}>
            <Typography
              variant="h4"
              color="green"
              fontWeight="bold"
              gutterBottom
            >
              📊 Welcome to your Dashboard
            </Typography>
            <Typography sx={{ mb: 3 }}>
              Here you can view assignments, manage submissions, register
              courses, and rate coaches.
            </Typography>

            {/* Summary Cards */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 4 }}>
              <Paper sx={{ flex: 1, p: 2, minWidth: 200, bgcolor: "#d1fae5" }}>
                <Typography variant="h6">Assignments</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {assignments.length}
                </Typography>
              </Paper>
              <Paper sx={{ flex: 1, p: 2, minWidth: 200, bgcolor: "#fef9c3" }}>
                <Typography variant="h6">My Submissions</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {mySubmissions.length}
                </Typography>
              </Paper>
              <Paper sx={{ flex: 1, p: 2, minWidth: 200, bgcolor: "#bfdbfe" }}>
                <Typography variant="h6">Active Courses</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {courses.length}
                </Typography>
              </Paper>
            </Box>

            {/* Bar Chart for assignments */}
            <Box sx={{ height: 300, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Assignment Status
              </Typography>
              <div style={{ height: 250, width: "100%" }}>
                <DataGrid
                  rows={assignments.map((a, idx) => ({
                    id: idx,
                    title: a.title,
                    status: a.status,
                  }))}
                  columns={[
                    { field: "title", headerName: "Assignment", width: 300 },
                    {
                      field: "status",
                      headerName: "Status",
                      width: 200,
                      renderCell: (params) => (
                        <Typography
                          color={params.value === "pending" ? "red" : "green"}
                        >
                          {params.value.charAt(0).toUpperCase() +
                            params.value.slice(1)}
                        </Typography>
                      ),
                    },
                  ]}
                  pageSize={5}
                  hideFooter
                />
              </div>
            </Box>

            {/* Quick Coach Rating & Upcoming Classes */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {/* Quick Coach Rating */}
              <Paper sx={{ flex: 1, minWidth: 300, p: 2, bgcolor: "#fef2f2" }}>
                <Typography variant="h6">Rate a Coach</Typography>
                <TextField
                  select
                  label="Select Coach"
                  value={selectedCoach || ""}
                  onChange={(e) => setSelectedCoach(e.target.value)}
                  fullWidth
                  sx={{ my: 2 }}
                >
                  <MenuItem value="">-- Select Coach --</MenuItem>
                  {coaches.map((c) => (
                    <MenuItem key={c._id} value={c._id}>
                      {c.fullName}
                    </MenuItem>
                  ))}
                </TextField>
                {selectedCoach && (
                  <Rating
                    value={rating}
                    onChange={(e, newValue) => setRating(newValue)}
                  />
                )}
                {selectedCoach && (
                  <TextField
                    label="Comment"
                    fullWidth
                    multiline
                    rows={3}
                    sx={{ mb: 2 }}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write a comment about the coach..."
                  />
                )}
                <Button
                  variant="contained"
                  color="success"
                  sx={{ mt: 2 }}
                  onClick={handleSubmitFeedback}
                  disabled={!selectedCoach || rating === 0}
                >
                  Submit Rating
                </Button>
              </Paper>

              {/* Upcoming Classes */}
              <Paper sx={{ flex: 1, minWidth: 300, p: 2, bgcolor: "#e0f2fe" }}>
                <Typography variant="h6" gutterBottom>
                  Upcoming Classes
                </Typography>
                {activeCohorts.length === 0 ? (
                  <Typography>No upcoming classes</Typography>
                ) : (
                  activeCohorts.map((cohort) => (
                    <Box key={cohort.cohortId} sx={{ mb: 2 }}>
                      <Typography fontWeight="bold">
                        {cohort.cohortName}
                      </Typography>
                      {cohort.notStartedCourses?.length > 0 ? (
                        cohort.notStartedCourses.map((c) => (
                          <Typography key={c.courseId._id} variant="body2">
                            {c.courseId.name} - Starts:{" "}
                            {c.courseId.startDate || "N/A"}
                          </Typography>
                        ))
                      ) : (
                        <Typography variant="body2">
                          No upcoming courses
                        </Typography>
                      )}
                    </Box>
                  ))
                )}
              </Paper>
            </Box>
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
              {selectedCoach && (
                <Typography sx={{ mt: 1 }}>
                  Selected Coach:{" "}
                  {coaches.find((c) => c._id === selectedCoach)?.fullName}
                </Typography>
              )}

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
        {/* Register Course */}
        {activeTab === "register-course" && (
          <Paper sx={{ p: 4 }}>
            {cohortLoading ? (
              <CircularProgress />
            ) : !Array.isArray(activeCohorts) || activeCohorts.length === 0 ? (
              <Typography variant="h5" color="red">
                ❌ No available cohorts
              </Typography>
            ) : (
              <>
                <Typography variant="h4" color="green" fontWeight="bold">
                  📝 Register to a Cohort
                </Typography>

                {/* Cohort dropdown */}
                <TextField
                  select
                  label="Choose Cohort"
                  fullWidth
                  value={selectedCohort || ""}
                  onChange={(e) => {
                    setSelectedCohort(e.target.value);
                    setSelectedCourse("");
                  }}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="">-- Select Cohort --</MenuItem>
                  {activeCohorts.map((cohort) => (
                    <MenuItem key={cohort.cohortId} value={cohort.cohortId}>
                      {cohort.cohortName} ({cohort.startDate || "N/A"} -{" "}
                      {cohort.endDate || "N/A"})
                    </MenuItem>
                  ))}
                </TextField>

                {/* Courses dropdown */}
                {selectedCohort &&
                  (() => {
                    const selected = activeCohorts.find(
                      (c) => c.cohortId === selectedCohort
                    );

                    // ✅ Use courses returned from backend
                    const coursesList = selected?.courses || [];

                    return (
                      <>
                        <TextField
                          select
                          label="Choose Course"
                          fullWidth
                          value={selectedCourse || ""}
                          onChange={(e) => setSelectedCourse(e.target.value)}
                          sx={{ mb: 2 }}
                        >
                          <MenuItem value="">-- Select Course --</MenuItem>

                          {coursesList.length === 0 ? (
                            <MenuItem disabled>No courses available</MenuItem>
                          ) : (
                            coursesList.map((courseItem) => (
                              <MenuItem
                                key={courseItem.courseId}
                                value={courseItem.courseId}
                              >
                                {courseItem.name} ({courseItem.category}) -{" "}
                                {courseItem.duration}
                              </MenuItem>
                            ))
                          )}
                        </TextField>

                        <Button
                          variant="contained"
                          color="success"
                          disabled={!selectedCourse || registerLoading}
                          onClick={() =>
                            handleRegisterStudent(
                              selectedCohort,
                              selectedCourse
                            )
                          }
                        >
                          {registerLoading ? "Registering..." : "Register"}
                        </Button>
                      </>
                    );
                  })()}
              </>
            )}
          </Paper>
        )}
      </Box>

      {/* Success Modal */}
      <Modal open={successModalOpen} onClose={() => setSuccessModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            ✅ Successfully Registered!
          </Typography>
          <Typography>You will be redirected to payment shortly...</Typography>
        </Box>
      </Modal>
    </Box>
  );
};

export default StudentDashboard;
