import React, { useState, useEffect, useRef } from "react";
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
import { Videocam } from "@mui/icons-material";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { pdfjs } from "react-pdf";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "../Admin/AdninStudent.css";
import io from "socket.io-client";
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.9.179/build/pdf.worker.min.js`;

const drawerWidth = 250;

const StudentDashboard = () => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [globalLoading, setGlobalLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [myDocuments, setMyDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

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
  const [upcomingClass, setUpcomingClass] = useState(null);
  const [upcomingDocuments, setUpcomingDocuments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [cohortId, setCohortId] = useState("");

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeCohorts, setActiveCohorts] = useState([]);
  const [selectedCohort, setSelectedCohort] = useState("");
  const [cohortLoading, setCohortLoading] = useState(true);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [openAssignmentModal, setOpenAssignmentModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [submittedFile, setSubmittedFile] = useState(null);
  const [nextClass, setNextClass] = useState(null);
  const [nextClassCountdown, setNextClassCountdown] = useState("");
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [countdown, setCountdown] = useState("");
  const [tick, setTick] = useState(0);

  const [chatMessages, setChatMessages] = useState([]);
  const socketRef = useRef(null);
  const [text, setText] = useState("");

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
    { text: "Join Class", icon: <Videocam />, key: "join-class" },
  ];
  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/cohort/available`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.cohorts?.length > 0) {
          // setCohorts(res.data.cohorts);
          // setSelectedCohortId(res.data.cohorts[0].cohortId);
          setCohortId(res.data.cohorts[0].cohortId);
        } else {
          console.warn("No cohorts found in response", res.data);
        }
      } catch (err) {
        console.error("Failed to fetch cohorts:", err);
      }
    };

    fetchCohorts();
  }, []);

  // Send cohort chat message
  const sendMessage = async () => {
    if (!cohortId) {
      console.error("❌ cohortId is missing");
      return;
    }

    if (!text.trim()) return;

    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/api/cohort-chat/${cohortId}/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Send failed:", data);
      return;
    }

    setText("");
  };

  // Chat socket for cohort messages
  useEffect(() => {
    if (!cohortId) return;

    const token = localStorage.getItem("token");

    const socket = io(BASE_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.emit("joinCohort", { cohortId });

    socket.on("cohortMessage", (msg) => {
      setChatMessages((prev) => (Array.isArray(prev) ? [...prev, msg] : [msg]));
    });

    return () => {
      socket.off("cohortMessage");
      socket.disconnect();
    };
  }, [cohortId]);

  // Fetch cohort chat messages

  useEffect(() => {
    if (!cohortId) return;

    fetch(`${BASE_URL}/api/cohort-chat/${cohortId}/messages`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setChatMessages(Array.isArray(data.messages) ? data.messages : []);
      })
      .catch(console.error);
  }, [cohortId]);

  // Fetch documents for student

  const fetchDocuments = async () => {
    try {
      setLoadingDocuments(true);
      const { data } = await axios.get(`${BASE_URL}/api/coach/doc`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("📄 Fetched documents", data);

      // Normalize documents: make sure courseName is always available
      const allDocs = [
        ...(data.unlockedMaterials || []),
        ...(data.upcomingMaterials || []),
      ].map((doc) => ({
        ...doc,
        courseName:
          typeof doc.courseId === "object"
            ? doc.courseId.name
            : courses.find((c) => c._id === doc.courseId)?.name || "Unknown",
      }));

      setDocuments(allDocs);

      // ✅ Grab next class info
      setNextClass(data.nextClass || null);
      setNextClassCountdown(data.nextClassCountdown || "");
    } catch (err) {
      console.error("❌ Error fetching documents:", err);
      setDocuments([]);
      setNextClass(null);
      setNextClassCountdown("");
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Fetch unlocked videos
  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/coach/video`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setVideos(data.unlockedMaterials || []);
      }
      console.log("Fetched videos:", data);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setLoadingVideos(false);
    }
  };
  useEffect(() => {
    if (activeTab === "join-class") {
      fetchDocuments();
      fetchVideos();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchVideos();
  }, []);

  // upcoming classes
  useEffect(() => {
    const loadClass = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${BASE_URL}/api/coach/video`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const materials = res.data.unlockedMaterials || [];
        setVideos(materials);

        const now = Date.now();

        // 1️⃣ Classes already unlocked (class is ON now)
        const activeClasses = materials.filter(
          (m) =>
            m.unlockAt &&
            !isNaN(new Date(m.unlockAt)) &&
            new Date(m.unlockAt).getTime() <= now
        );

        // 2️⃣ Classes that start later (future)
        const futureClasses = materials.filter(
          (m) =>
            m.unlockAt &&
            !isNaN(new Date(m.unlockAt)) &&
            new Date(m.unlockAt).getTime() > now
        );

        let nextClass = null;

        if (activeClasses.length > 0) {
          // choose the most recently unlocked class
          nextClass = activeClasses.sort(
            (a, b) =>
              new Date(b.unlockAt).getTime() - new Date(a.unlockAt).getTime()
          )[0];
        } else if (futureClasses.length > 0) {
          // choose the nearest upcoming class
          nextClass = futureClasses.sort(
            (a, b) =>
              new Date(a.unlockAt).getTime() - new Date(b.unlockAt).getTime()
          )[0];
        }

        setUpcomingClass(nextClass || null);
      } catch (err) {
        console.error("Failed to load class:", err);
      }
    };

    loadClass();
  }, []);

  // Load not started cohorts
  useEffect(() => {
    const loadNotStartedCohorts = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/cohort/active`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        console.log(res.data.cohorts);

        if (res.data.cohorts) {
          setActiveCohorts(res.data.cohorts);
        } else {
          setMessage(res.data.message || "Unknown response");
          setActiveCohorts([]);
        }
      } catch (err) {
        console.error("Frontend Error:", err.response?.data || err);
        setMessage(err.response?.data?.message || "Request failed");
        setActiveCohorts([]);
      } finally {
        setCohortLoading(false);
      }
    };

    loadNotStartedCohorts();
  }, [BASE_URL, token]);

  // Function to handle viewing or submitting assignment
  const handleViewAssignment = (assignments) => {
    setSelectedAssignment(assignments);
    setSubmittedFile(null);
    setOpenAssignmentModal(true);
    // console.log(assignments);
    // navigate(`/assignments/${assignments.id}`);
  };

  // submit assignment by student
  const handleSubmitAssignment = async () => {
    if (!submittedFile) {
      alert("Please upload a file before submitting.");
      return;
    }

    setSubmittingAssignment(true); // start submitting

    const formData = new FormData();
    formData.append("file", submittedFile);

    try {
      const res = await axios.post(
        `${BASE_URL}/api/assignment/${selectedAssignment.assignmentId}/submit`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Assignment submitted successfully!");

      // Update mySubmissions with correct assignmentId from backend
      setMySubmissions((prev) => [
        ...prev,
        {
          assignmentId: selectedAssignment.assignmentId,
          fileUrl: res.data.fileUrl,
          submittedAt: res.data.submittedAt,
          grade: null, // grade will come later
        },
      ]);

      // Update assignments list so UI shows 'Submitted' immediately
      setAssignments((prev) =>
        prev.map((a) =>
          a.assignmentId === selectedAssignment.assignmentId
            ? {
                ...a,
                submissions: [{ fileUrl: res.data.fileUrl }],
                submittedFile: res.data.fileUrl,
                status: "Submitted",
                justSubmitted: true,
                grade: "-", // show "-" until graded
              }
            : a
        )
      );

      setOpenAssignmentModal(false);
      setSubmittedFile(null);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Error submitting assignment");
    } finally {
      setSubmittingAssignment(false); // finished submitting
    }
  };

  // =========================
  // FETCH ASSIGNMENTS
  // =========================

  // Loading assignments (ensure correct endpoint)
  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/assignment/student`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Sort most recent first
        const sortedAssignments = res.data.assignments.sort((a, b) => {
          const dateA = a.dueDate ? new Date(a.dueDate) : new Date(0);
          const dateB = b.dueDate ? new Date(b.dueDate) : new Date(0);
          return dateB - dateA; // most recent first
        });

        setAssignments(sortedAssignments);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load assignments");
        setAssignments([]);
      }
    };

    loadAssignments();
  }, [token]);

  // =========================
  // FETCH SUBMISSIONS
  // =========================
  // useEffect(() => {
  //   const loadSubmissions = async () => {
  //     try {
  //       const res = await axios.get(`${BASE_URL}/api/student/submissions`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       setMySubmissions(res.data);
  //     } catch (err) {
  //       console.error(err);
  //       setMessage("Failed to load submissions");
  //     }
  //   };
  //   loadSubmissions();
  // }, []);

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
    // loadAssignments();
  }, []);

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
  // REGISTER STUDENT FOR A COHORT
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
      console.error("REGISTER ERROR:", err);

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Registration failed";

      setMessage(backendMessage);
      // setMessage(err.response?.data?.message || "Failed to register");
    } finally {
      setRegisterLoading(false);
    }
  };
  // countdown for next class
  useEffect(() => {
    if (!nextClass?.unlockAt) return;

    const updateCountdown = () => {
      setCountdown(getCountdownString(nextClass.unlockAt));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextClass]);
  // countdown string function for next class
  function getCountdownString(unlockAt) {
    const now = new Date();
    const unlockDate = new Date(unlockAt);
    const diffMs = unlockDate.getTime() - now.getTime();

    if (diffMs <= 0) return "Unlocked";

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  }

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
                  {
                    assignments.filter(
                      (a) => a.status?.toLowerCase() === "submitted"
                    ).length
                  }
                </Typography>
              </Paper>

              <Paper sx={{ flex: 1, p: 2, minWidth: 200, bgcolor: "#bfdbfe" }}>
                <Typography variant="h6">Active Courses</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {courses.length}
                </Typography>
              </Paper>
            </Box>

            {/* Assignment Table */}
            <Box sx={{ height: 300, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Assignment Status
              </Typography>

              <div style={{ height: 250, width: "100%" }}>
                <DataGrid
                  rows={assignments.map((a, idx) => ({
                    id: idx,
                    title: a.title || "Untitled",
                    status:
                      a.status?.toLowerCase() === "submitted"
                        ? "Submitted"
                        : "Pending",
                  }))}
                  columns={[
                    { field: "title", headerName: "Assignment", width: 300 },
                    {
                      field: "status",
                      headerName: "Status",
                      width: 200,
                      renderCell: (params) => (
                        <Typography
                          color={
                            (params.value || "Pending").toLowerCase() ===
                            "pending"
                              ? "red"
                              : "green"
                          }
                        >
                          {params.value || "Pending"}
                        </Typography>
                      ),
                    },
                  ]}
                  pageSize={5}
                  hideFooter
                />
              </div>
            </Box>

            {/* Quick Coach Rating + Upcoming Class */}
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

              {/* Upcoming Class */}
              <Paper sx={{ flex: 1, minWidth: 300, p: 2, bgcolor: "#e0f2fe" }}>
                <Typography variant="h6" gutterBottom>
                  Upcoming Class
                </Typography>

                {!nextClass ? (
                  <Typography>No upcoming class available</Typography>
                ) : (
                  <Paper sx={{ p: 2, mt: 2 }}>
                    <Typography fontWeight="bold">
                      {nextClass.courseId?.name || "Course"}
                    </Typography>

                    {(() => {
                      // ================================
                      //          TIME LOGIC (UTC)
                      // ================================

                      const unlockTimeUTC = nextClass.unlockAt
                        ? new Date(nextClass.unlockAt)
                        : null;

                      const nowUTC = new Date(new Date().toISOString()); // force UTC

                      const isValid =
                        unlockTimeUTC instanceof Date &&
                        !isNaN(unlockTimeUTC.getTime());

                      const isUnlocked = isValid && nowUTC >= unlockTimeUTC;

                      // Format as: Mon, Dec 15, 2025, 09:18 AM UTC
                      const formattedUTC = isValid
                        ? unlockTimeUTC.toLocaleString("en-US", {
                            timeZone: "UTC",
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }) + " UTC"
                        : "Unknown Date";

                      // ================================
                      //        COUNTDOWN TEXT
                      // ================================
                      let countdownText = "";
                      if (isValid && !isUnlocked) {
                        const diff = unlockTimeUTC - nowUTC;
                        const totalSeconds = Math.floor(diff / 1000);
                        const hours = Math.floor(totalSeconds / 3600);
                        const minutes = Math.floor((totalSeconds % 3600) / 60);
                        const seconds = totalSeconds % 60;
                        countdownText = `${hours}h ${minutes}m ${seconds}s`;
                      }

                      return (
                        <>
                          {/* Start Time */}
                          <Typography sx={{ mt: 1 }}>
                            Time: {formattedUTC}
                          </Typography>

                          {/* Countdown */}
                          {!isUnlocked && isValid && (
                            <Typography
                              variant="body2"
                              color="orange"
                              sx={{ mt: 1 }}
                            >
                              ⏳ Starts in: {countdownText}
                            </Typography>
                          )}

                          {/* LOCKED MESSAGE */}
                          {!isUnlocked && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              🔒 Class not accessible yet
                            </Typography>
                          )}

                          {/* UNLOCKED CONTENT */}
                          {isUnlocked && (
                            <>
                              {nextClass.fileUrl ? (
                                <>
                                  {nextClass.type === "video" ? (
                                    <video
                                      src={nextClass.fileUrl}
                                      controls
                                      style={{
                                        width: "100%",
                                        marginTop: 10,
                                        borderRadius: 8,
                                      }}
                                    />
                                  ) : (
                                    <Typography sx={{ mt: 2 }}>
                                      Document available
                                    </Typography>
                                  )}

                                  <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{ mt: 2 }}
                                    href={nextClass.fileUrl}
                                    target="_blank"
                                  >
                                    Open Full{" "}
                                    {nextClass.type === "video"
                                      ? "Video"
                                      : "Document"}
                                  </Button>
                                </>
                              ) : (
                                <Typography sx={{ mt: 2 }}>
                                  No file available
                                </Typography>
                              )}
                            </>
                          )}

                          {/* VIDEO LISTING */}
                          {videos.map((video) => {
                            const courseName =
                              courses.find((c) => c._id === video.courseId?._id)
                                ?.name || "Unknown";

                            const unlockAt = new Date(video.unlockAt);
                            const now = new Date();
                            const isUnlocked = now >= unlockAt;

                            const unlockAtFormatted = unlockAt.toLocaleString(
                              "en-US",
                              {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              }
                            );

                            return (
                              <Box
                                key={video._id}
                                sx={{
                                  p: 2,
                                  mb: 3,
                                  borderRadius: 2,
                                  border: "1px solid #ddd",
                                  ...(isUnlocked && {
                                    borderColor: "red",
                                    animation: "glowPulse 1.8s infinite",
                                  }),
                                }}
                                className={isUnlocked ? "glow" : ""}
                              >
                                <Typography variant="h6" fontWeight="bold">
                                  🎬 {video.title}
                                  {isUnlocked && (
                                    <span className="live-badge">LIVE</span>
                                  )}
                                </Typography>

                                <Typography sx={{ mb: 1 }}>
                                  Course: {courseName}
                                </Typography>

                                {!isUnlocked ? (
                                  <Typography
                                    sx={{ color: "red", fontWeight: "bold" }}
                                  >
                                    ⏳ Unlocks at: {unlockAtFormatted}
                                  </Typography>
                                ) : (
                                  <video
                                    width="100%"
                                    controls
                                    autoPlay={true}
                                    style={{
                                      borderRadius: "10px",
                                      marginTop: "10px",
                                    }}
                                  >
                                    <source
                                      src={video.videoUrl}
                                      type="video/mp4"
                                    />
                                    Your browser does not support the video tag.
                                  </video>
                                )}
                              </Box>
                            );
                          })}
                        </>
                      );
                    })()}
                  </Paper>
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
        {/* Join Class Tab */}
        {activeTab === "join-class" && (
          <Paper sx={{ p: 4 }}>
            <Typography
              variant="h4"
              fontWeight="bold"
              color="primary"
              sx={{ mt: 6 }}
            >
              📚 Your Class Materials
            </Typography>

            {loadingVideos || loadingDocuments || !courses.length ? (
              <Typography sx={{ mt: 2 }}>Loading classes...</Typography>
            ) : videos.length === 0 && documents.length === 0 ? (
              <Typography sx={{ mt: 2 }}>
                Class is not available now.
              </Typography>
            ) : (
              <>
                {/* Render videos */}
                {videos.map((video) => {
                  const courseName =
                    courses.find((c) => c._id === video.courseId)?.name ||
                    "Unknown";
                  const now = new Date();
                  const unlockAt = new Date(video.unlockAt);
                  const expireTime = new Date(
                    unlockAt.getTime() + 3 * 60 * 60 * 1000
                  );
                  const isUnlocked = now >= unlockAt && now <= expireTime;

                  return (
                    <Paper
                      key={video._id}
                      sx={{ p: 2, mt: 2, bgcolor: "#fff7f0" }}
                    >
                      <Typography variant="h6" fontWeight="bold">
                        🎥 {video.title}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Course:{" "}
                        <span style={{ color: "green" }}>{courseName}</span>
                      </Typography>

                      {isUnlocked && video.fileUrl ? (
                        <>
                          <Typography variant="body2">
                            Uploaded:{" "}
                            {new Date(video.createdAt).toLocaleDateString()}
                          </Typography>
                          <video
                            style={{
                              marginTop: 15,
                              width: "100%",
                              borderRadius: 8,
                            }}
                            controls
                            controlsList="nodownload"
                            src={video.fileUrl}
                          />
                          <Typography
                            variant="caption"
                            sx={{ display: "block", mt: 1, color: "gray" }}
                          >
                            Video is available for 3 hours only.
                          </Typography>
                        </>
                      ) : (
                        <Typography sx={{ mt: 1, color: "orange" }}>
                          Class will start on {unlockAt.toLocaleString()}
                        </Typography>
                      )}
                    </Paper>
                  );
                })}

                {/* Render documents */}
                {documents.map((doc) => {
                  const unlockDateUTC = new Date(doc.unlockAt);
                  const nowUTC = new Date(new Date().toISOString()); // updates because tick changes

                  const isUnlocked = nowUTC >= unlockDateUTC;

                  // Countdown calc
                  let countdownText = "";
                  if (!isUnlocked) {
                    const diffMs = unlockDateUTC - nowUTC;
                    if (diffMs <= 0) {
                      countdownText = "Few seconds...";
                    } else {
                      const totalSeconds = Math.floor(diffMs / 1000);
                      const hours = Math.floor(totalSeconds / 3600);
                      const minutes = Math.floor((totalSeconds % 3600) / 60);
                      const seconds = totalSeconds % 60;
                      countdownText = `${hours}h ${minutes}m ${seconds}s`;
                    }
                  }

                  const unlockUTCString =
                    unlockDateUTC.toLocaleString("en-US", {
                      timeZone: "UTC",
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }) + " UTC";

                  return (
                    <Paper
                      key={doc._id}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderLeft: isUnlocked
                          ? "4px solid green"
                          : "4px solid orange",
                      }}
                    >
                      <Typography variant="h6">{doc.title}</Typography>

                      <Typography variant="body2">
                        Course: {doc.courseId?.name || "Unknown"}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          mt: 1,
                          color: isUnlocked ? "green" : "orange",
                          fontWeight: 700,
                        }}
                      >
                        {isUnlocked ? "Available Now" : "Will unlock at:"}
                      </Typography>

                      {!isUnlocked && (
                        <Typography
                          variant="body2"
                          sx={{ fontStyle: "italic", opacity: 0.7 }}
                        >
                          UTC Time: {unlockUTCString}
                        </Typography>
                      )}

                      {!isUnlocked && (
                        <Typography
                          sx={{ mt: 1, color: "red", fontWeight: "bold" }}
                        >
                          Starts in: {countdownText}
                        </Typography>
                      )}

                      {isUnlocked && doc.fileUrl ? (
                        <Box sx={{ mt: 2, height: 500 }}>
                          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.9.179/build/pdf.worker.min.js">
                            <Viewer
                              fileUrl={doc.fileUrl}
                              plugins={[defaultLayoutPluginInstance]}
                            />
                          </Worker>
                        </Box>
                      ) : (
                        !isUnlocked && (
                          <Button variant="outlined" disabled>
                            Locked
                          </Button>
                        )
                      )}
                    </Paper>
                  );
                })}

                {/* Class chat - only if any material is unlocked */}
                {(videos.some(
                  (v) =>
                    new Date(v.unlockAt) <= new Date() &&
                    new Date() <=
                      new Date(
                        new Date(v.unlockAt).getTime() + 3 * 60 * 60 * 1000
                      )
                ) ||
                  documents.some((d) => new Date(d.unlockAt) <= new Date())) &&
                  nextClass &&
                  nextClass.courseId &&
                  (() => {
                    const user = JSON.parse(
                      localStorage.getItem("user") || "{}"
                    );
                    const studentId = user?._id || user?.id;
                    const coachId = nextClass.coachId?._id || nextClass.coachId;

                    if (!coachId || !studentId) {
                      console.debug(
                        "Chat not shown: missing coachId or studentId",
                        { coachId, studentId, nextClass }
                      );
                      return null;
                    }

                    return (
                      <Box sx={{ mt: 2 }}>
                        <Typography fontWeight="bold">
                          💬 Cohort Chat
                        </Typography>

                        <Box sx={{ maxHeight: 250, overflowY: "auto", mb: 1 }}>
                          {chatMessages.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                              No messages yet
                            </Typography>
                          ) : (
                            chatMessages.map((m, i) => (
                              <Typography key={m._id || i} sx={{ mb: 0.5 }}>
                                <strong>
                                  {typeof m.senderId === "object"
                                    ? m.senderId.fullName
                                    : m.senderId}
                                </strong>
                                : {m.text}
                              </Typography>
                            ))
                          )}
                        </Box>

                        <Box sx={{ display: "flex", gap: 1 }}>
                          <TextField
                            fullWidth
                            size="small"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Type message..."
                          />
                          <Button onClick={sendMessage} variant="contained">
                            Send
                          </Button>
                        </Box>
                      </Box>
                    );
                  })()}
              </>
            )}
          </Paper>
        )}

        {/* ASSIGNMENTS TAB */}
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

            {/* ==================== VIEW / SUBMIT MODAL ==================== */}
            <Modal
              open={openAssignmentModal}
              onClose={() => setOpenAssignmentModal(false)}
            >
              <Box
                sx={{
                  width: "90%",
                  maxWidth: 500,
                  background: "#fff",
                  p: 4,
                  borderRadius: 4,
                  mx: "auto",
                  mt: 10,
                  boxShadow: 4,
                }}
              >
                {selectedAssignment ? (
                  <>
                    <Typography variant="h5" fontWeight="bold" color="green">
                      {selectedAssignment.title}
                    </Typography>

                    <Typography sx={{ mt: 2 }}>
                      <strong>Description:</strong>{" "}
                      {selectedAssignment.description}
                    </Typography>

                    <Typography sx={{ mt: 1 }}>
                      <strong>Course:</strong> {selectedAssignment.courseName}
                    </Typography>

                    <Typography sx={{ mt: 1 }}>
                      <strong>Due Date:</strong>{" "}
                      {selectedAssignment.dueDate
                        ? new Date(
                            selectedAssignment.dueDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </Typography>

                    {/* Already Submitted */}
                    {selectedAssignment.submittedFile ? (
                      <Box sx={{ mt: 3 }}>
                        <Typography color="green" fontWeight="bold">
                          ✔ You already submitted this assignment
                        </Typography>

                        <Button
                          sx={{ mt: 2 }}
                          variant="contained"
                          color="success"
                          href={selectedAssignment.submittedFile}
                          target="_blank"
                        >
                          View Submitted File
                        </Button>
                      </Box>
                    ) : selectedAssignment.isExpired ? (
                      <Typography
                        color="red"
                        sx={{ mt: 3, fontWeight: "bold" }}
                      >
                        ⚠ Assignment Expired
                      </Typography>
                    ) : (
                      <>
                        {/* Upload File */}
                        <Box sx={{ mt: 3 }}>
                          <Typography fontWeight="bold">Upload File</Typography>
                          <input
                            type="file"
                            style={{ marginTop: 10 }}
                            onChange={(e) =>
                              setSubmittedFile(e.target.files[0])
                            }
                          />
                        </Box>

                        <Button
                          sx={{ mt: 3 }}
                          variant="contained"
                          color="success"
                          fullWidth
                          onClick={handleSubmitAssignment}
                          disabled={submittingAssignment} // disable during submission
                        >
                          {submittingAssignment ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            "Submit Assignment"
                          )}
                        </Button>
                      </>
                    )}

                    <Button
                      sx={{ mt: 2 }}
                      fullWidth
                      variant="outlined"
                      color="error"
                      onClick={() => setOpenAssignmentModal(false)}
                    >
                      Close
                    </Button>
                  </>
                ) : (
                  <Typography>Loading...</Typography>
                )}
              </Box>
            </Modal>

            {/* ==================== LIST OF ASSIGNMENTS ==================== */}
            {!assignments || assignments.length === 0 ? (
              <Typography sx={{ mt: 3, color: "gray", textAlign: "center" }}>
                {message || "No assignments available."}
              </Typography>
            ) : (
              <div style={{ width: "100%", overflowX: "auto" }}>
                <DataGrid
                  getRowId={(row) => row.assignmentId}
                  rows={assignments.map((a) => {
                    const dueDate = a.dueDate ? new Date(a.dueDate) : null;
                    const isExpired = dueDate ? dueDate < new Date() : false;

                    return {
                      id: a.assignmentId,
                      assignmentId: a.assignmentId,
                      title: a.title,
                      courseName: a.courseName || "N/A",
                      description: a.description,
                      dueDate: dueDate ? dueDate.toLocaleDateString() : "N/A",
                      submittedFile: a.file || null,
                      status:
                        a.status?.toLowerCase() === "submitted"
                          ? "Submitted"
                          : isExpired
                          ? "Expired"
                          : "Pending",
                      grade: a.grade || "-",
                      isExpired,
                      justSubmitted: a.justSubmitted || false, // flag after submission
                    };
                  })}
                  columns={[
                    { field: "title", headerName: "Assignment", width: 250 },
                    { field: "courseName", headerName: "Course", width: 180 },
                    { field: "dueDate", headerName: "Due Date", width: 160 },

                    {
                      field: "status",
                      headerName: "Status",
                      width: 120,
                      renderCell: (params) => (
                        <Typography
                          color={
                            params.value === "Pending"
                              ? "red"
                              : params.value === "Expired"
                              ? "gray"
                              : "green"
                          }
                        >
                          {params.value}
                        </Typography>
                      ),
                    },

                    {
                      field: "grade",
                      headerName: "Grade",
                      width: 100,
                      renderCell: (params) => (
                        <Typography
                          color={params.value === "-" ? "gray" : "blue"}
                        >
                          {params.value}
                        </Typography>
                      ),
                    },

                    {
                      field: "actions",
                      headerName: "Actions",
                      width: 220,
                      renderCell: (params) => {
                        const disabled =
                          params.row.status === "Submitted" ||
                          params.row.isExpired ||
                          params.row.justSubmitted;

                        return (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            disabled={disabled}
                            onClick={() => handleViewAssignment(params.row)}
                          >
                            {disabled
                              ? params.row.justSubmitted ||
                                params.row.status === "Submitted"
                                ? "Submitted"
                                : params.row.isExpired
                                ? "Expired"
                                : "Not Available"
                              : "View Details / Submit"}
                          </Button>
                        );
                      },
                    },
                  ]}
                  pageSize={5}
                  hideFooter
                />
              </div>
            )}
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
        {activeTab === "register-course" && (
          <Paper sx={{ p: 4 }}>
            {cohortLoading ? (
              <CircularProgress />
            ) : Array.isArray(activeCohorts) && activeCohorts.length === 0 ? (
              <Typography variant="h5" color="red">
                ❌ No available cohorts
              </Typography>
            ) : (
              <>
                <Typography
                  variant="h4"
                  color="green"
                  fontWeight="bold"
                  gutterBottom
                >
                  📝 Register to a Cohort
                </Typography>
                {message && (
                  <Typography
                    variant="body1"
                    color="error"
                    sx={{ mb: 2, fontWeight: "bold" }}
                  >
                    {message}
                  </Typography>
                )}

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
                      {cohort.cohortName}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Courses dropdown */}
                {selectedCohort &&
                  (() => {
                    const selected = activeCohorts.find(
                      (c) => c.cohortId === selectedCohort
                    );
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
                          {coursesList.map((course) => (
                            <MenuItem key={course._id} value={course._id}>
                              {course.name || "Unnamed"} (
                              {course.category || "N/A"}) -{" "}
                              {course.durationInDays || "N/A"}
                            </MenuItem>
                          ))}
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
