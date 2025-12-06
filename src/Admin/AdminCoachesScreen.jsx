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
import { useParams } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";

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
  const [classStartTime, setClassStartTime] = useState("");
  const [courses, setCourses] = useState([]);

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
  const [cohorts, setCohorts] = useState([]);
  const [selectedCohortId, setSelectedCohortId] = useState("");
  const [flattenedSubmissions, setFlattenedSubmissions] = useState([]);

  const [studentAssignments, setStudentAssignments] = useState([]);
  const [studentAssignmentsLoading, setStudentAssignmentsLoading] =
    useState(true);

  const [openAssignmentModal, setOpenAssignmentModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [gradeInput, setGradeInput] = useState("");
  const [gradingLoading, setGradingLoading] = useState(false);

  const [assignedCourses, setAssignedCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loadingAssigned, setLoadingAssigned] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [coursesArray, setCoursesArray] = useState([]);

  const [myVideos, setMyVideos] = useState([]);
  const [unlockAt, setUnlockAt] = useState("");

  const { cohortIds } = useParams();
  console.log("COHORT ID FROM URL:", cohortId);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const isMobile = useMediaQuery("(max-width:900px)");

  const barColors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#6366f1"];

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, key: "dashboard" },
    { text: "Upload Video", icon: <UploadFile />, key: "upload-video" },
    { text: "Upload Document", icon: <UploadFile />, key: "upload-doc" },
    // { text: "All Videos", icon: <UploadFile />, key: "videos" },
    // { text: "All Documents", icon: <UploadFile />, key: "documents" },
    { text: "Assignments", icon: <AssignmentTurnedIn />, key: "assignments" },
    { text: "Students", icon: <School />, key: "students" },
    {
      text: "Start / End Course",
      icon: <AssignmentTurnedIn />,
      key: "course-control",
    },
    { text: "Live Mode", icon: <LiveTv />, key: "live" },
  ];

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!docFile || !docTitle || !unlockAt) return;

    setLoading(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("title", docTitle);
    formData.append("courseId", selectedCourseId); // ensure this comes from your course selection
    formData.append("unlockAt", unlockAt);
    formData.append("file", docFile);

    try {
      const res = await fetch(`${BASE_URL}/api/material/upload-document`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      alert("Document uploaded successfully!");
      // Optionally refresh the document list
      setDocTitle("");
      setDocFile(null);
      setUnlockAt("");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };
  // FETCH  VIDEOS UPLOADED BY THE COACH
  const fetchMyVideos = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/coach/my-videos`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const videosArray = Array.isArray(data) ? data : data.videos || [];
      setMyVideos(videosArray);

      console.log("Fetched videos:", videosArray);
    } catch (error) {
      console.error("Failed to load videos", error);
      setMyVideos([]); // prevent map crash
    }
  };

  useEffect(() => {
    fetchMyVideos();
  }, []);

  // DELETE VIDEO
  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/coach/delete-video/${videoId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Remove video from UI
      setMyVideos((prev) => prev.filter((v) => v._id !== videoId));

      alert("Video deleted successfully");
    } catch (error) {
      console.error("Failed to delete video", error);
      alert("Failed to delete video");
    }
  };

  //open assignment modal

  const handleOpenAssignmentModal = (assignment, submission) => {
    setSelectedAssignment({ ...assignment, submission });
    setGradeInput(submission?.grade || "");
    setOpenAssignmentModal(true);
  };
  // close assignment modal
  const handleCloseAssignmentModal = () => {
    setSelectedAssignment(null);
    setGradeInput("");
    setOpenAssignmentModal(false);
  };

  // submit grade
  const submitGrade = async (studentId) => {
    if (!gradeInput || !selectedAssignment || !studentId) {
      setMessage("❌ Missing grade or student ID");
      return;
    }

    const studentIdStr =
      typeof studentId === "string" ? studentId : studentId?._id;

    if (!studentIdStr) {
      setMessage("❌ Invalid student ID");
      return;
    }

    try {
      setGradingLoading(true);

      const gradeValue = Number(gradeInput);
      if (Number.isNaN(gradeValue)) {
        setMessage("❌ Grade must be a number");
        setGradingLoading(false);
        return;
      }

      const assignmentId =
        selectedAssignment.assignmentId || selectedAssignment._id;

      const res = await axios.put(
        `${BASE_URL}/api/assignment/grade/${assignmentId}/${studentIdStr}`,
        { grade: gradeValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("✅ Grade submitted successfully");
      handleCloseAssignmentModal();
      // ... update state as before
    } catch (err) {
      console.error("Failed to submit grade:", err?.response?.data || err);
      setMessage("❌ Failed to submit grade — check console for details");
    } finally {
      setGradingLoading(false);
    }
  };
  // Fetch assigned courses from API
  const fetchAssignedCourses = async () => {
    try {
      setLoadingAssigned(true);
      const res = await axios.get(`${BASE_URL}/api/cohort/coach/assigned`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("API response:", res.data);
      setAssignedCourses(res.data.cohorts || []);
    } catch (err) {
      console.error("Error fetching assigned courses:", err);
    } finally {
      setLoadingAssigned(false);
    }
  };
  // Transform assignedCourses into flat array for dropdown

  useEffect(() => {
    if (!assignedCourses || assignedCourses.length === 0) {
      setCoursesArray([]);
      return;
    }

    const flatCourses = assignedCourses.flatMap((cohort) =>
      cohort.courses.map((course) => ({
        cohortCourseId: course.cohortCourseId,
        courseId: course.courseId,
        courseName: course.name,
        cohortName: cohort.cohortName,
        status: course.status,
      }))
    );

    setCoursesArray(flatCourses);
  }, [assignedCourses]);
  // Start course
  const handleStartCourse = async () => {
    if (!selectedCourse) {
      alert("Please select a course to start");
      return;
    }

    try {
      setActionLoading(true);

      const { data } = await axios.put(
        `${BASE_URL}/api/cohort/start/course/${selectedCourse}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchAssignedCourses(); // refresh courses
      alert(data.message || "Course started successfully");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to start course");
    } finally {
      setActionLoading(false);
    }
  };

  // End course
  const handleEndCourse = async () => {
    if (!selectedCourse) {
      alert("Please select a course to end");
      return;
    }

    try {
      setActionLoading(true);

      const { data } = await axios.put(
        `${BASE_URL}/api/cohort/end/course/${selectedCourse}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchAssignedCourses(); // refresh courses
      alert(data.message || "Course ended successfully");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to end course");
    } finally {
      setActionLoading(false);
    }
  };
  useEffect(() => {
    if (!assignedCourses || assignedCourses.length === 0) {
      setCoursesArray([]);
      return;
    }

    const flatCourses = assignedCourses.flatMap((cohort) =>
      cohort.courses.map((course) => ({
        cohortCourseId: course.cohortCourseId,
        courseId: course.courseId,
        courseName: course.name,
        cohortName: cohort.cohortName,
        status: course.status,
      }))
    );

    setCoursesArray(flatCourses);
  }, [assignedCourses]);

  useEffect(() => {
    if (activeTab === "course-control") {
      fetchAssignedCourses();
    }
  }, [activeTab]);

  // ========================= // FETCH  ASSIGNMENT DONE BY STUDENT // =========================
  const loadStudentAssignments = async () => {
    setStudentAssignmentsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/assignment/student/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudentAssignments(res.data.assignments || []);
    } catch (err) {
      console.error(
        "Error fetching student assignments:",
        err?.response?.data || err
      );
      setMessage("Failed to load student assignments");
    } finally {
      setStudentAssignmentsLoading(false);
    }
  };
  useEffect(() => {
    loadStudentAssignments();
  }, []);

  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/cohort/available`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.cohorts?.length > 0) {
          setCohorts(res.data.cohorts);
          setSelectedCohortId(res.data.cohorts[0].cohortId);
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

    if (
      !videoTitle ||
      !videoFile ||
      !classStartTime ||
      !selectedCourseId ||
      !selectedCohortId
    ) {
      console.log({
        videoTitle,
        videoFile,
        classStartTime,
        selectedCourseId,
        selectedCohortId,
      });
      return alert("All fields are required!");
    }

    // Convert local datetime to UTC ISO string
    const localTime = new Date(classStartTime);
    const utcTime = new Date(
      Date.UTC(
        localTime.getFullYear(),
        localTime.getMonth(),
        localTime.getDate(),
        localTime.getHours(),
        localTime.getMinutes(),
        0,
        0
      )
    );

    const formData = new FormData();
    formData.append("title", videoTitle);
    formData.append("file", videoFile);
    formData.append("classStartTime", utcTime.toISOString()); // <-- use UTC ISO string
    formData.append("courseId", selectedCourseId);
    formData.append("cohortId", selectedCohortId);

    try {
      setLoading(true);
      const { data } = await axios.post(
        `${BASE_URL}/api/coach/upload-video`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(data.message);
      setVideoTitle("");
      setVideoFile(null);
      setClassStartTime("");
      setSelectedCourseId("");
      setSelectedCohortId("");
      loadVideos();
      await fetchMyVideos();
    } catch (error) {
      console.error(error);
      const errMsg =
        error.response?.data?.message || error.message || "Upload failed";
      setMessage(`❌ ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DOCUMENT UPLOAD
  // =========================

  const fetchCohorts = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/cohort/available`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // data.cohorts is an array of { cohortId, cohortName, courses }
      setCohorts(data.cohorts || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCohorts();
  }, []);

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

  // filepath: /home/pc/Desktop/new work/benedicta-digital-skill-new/digital-skill/src/Admin/AdminCoachesScreen.jsx
  const loadAssignments = async () => {
    setAssignmentsLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/assignment/coach-assignments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Assignments API response:", res.data);

      setAssignments(res.data.assignmentsByCohort || {}); // FIX
      setFlattenedSubmissions(res.data.submissions || []); // FIX
    } catch (err) {
      console.error("Error fetching assignments:", err?.response?.data || err);
      setMessage("Failed to load assignments");
      setAssignments({});
      setFlattenedSubmissions([]);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  // Create new assignment
  const createAssignment = async () => {
    if (!newTitle || !selectedCohortId) {
      setMessage("Title and cohort are required");
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/api/assignment`,
        {
          cohortId: selectedCohortId, // singular key
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

  // ========================= // FETCH COACH STUDENTS // =========================
  useEffect(() => {
    const loadStudents = async () => {
      console.log("📡 Fetching students...");
      setStudentsLoading(true); // set loading true at the start

      try {
        const res = await axios.get(`${BASE_URL}/api/cohort/students/coach`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("✅ Students response:", res.data);

        if (res.data.students) {
          setStudents(res.data.students);
        } else {
          console.warn("⚠ No 'students' field found in response");
          setStudents([]); // fallback
        }
      } catch (err) {
        console.error(
          "❌ Error fetching students:",
          err?.response?.data || err
        );
        setMessage("Failed to load students");
        setStudents([]); // fallback
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
  // fetch courses assigned to coach

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const { data } = await axios.get(
          `${BASE_URL}/api/course/my-courses-for-coach`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Courses data:", data); // check what is coming
        setCourses(data.courses || []);
      } catch (error) {
        console.error("Failed to load courses:", error);
      }
    };

    loadCourses();
  }, []);

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

  // ========================= // ASSIGNMENTS TAB =========================

  const assignmentRows = Object.values(assignments || {}).flatMap((list) =>
    list.flatMap((a) => {
      // CASE 1 — assignment has submissions
      if (Array.isArray(a.submissions) && a.submissions.length > 0) {
        return a.submissions.map((s, idx) => ({
          id: `${a._id}-${idx}`,
          assignmentId: a._id,
          title: a.title,
          description: a.description,
          cohortId: a.cohortId?._id,
          cohortName: a.cohortId?.name || "No Cohort", // ✔ FIXED
          studentId: s.studentId?._id,
          studentName: s.studentId?.fullName || "Unknown",
          grade: s.grade ?? "Not Graded",
          isGraded: s.grade != null,
          status: s.grade != null ? "Completed" : "Pending",
          dueDate: a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "N/A",
        }));
      }

      // CASE 2 — assignment has no submissions
      return [
        {
          id: `${a._id}-no-sub`,
          assignmentId: a._id,
          title: a.title,
          description: a.description,
          cohortId: a.cohortId?._id,
          cohortName: a.cohortId?.name || "No Cohort", // ✔ FIXED
          studentId: null,
          studentName: "-",
          grade: "Not Graded",
          isGraded: false,
          status: new Date(a.dueDate) < new Date() ? "Expired" : "Pending",
          dueDate: a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "N/A",
        },
      ];
    })
  );

  /// MOVE IT HERE (NOT ABOVE)
  console.log("RAW assignments:", assignments);
  console.log("assignmentRows:", assignmentRows);

  // ========================= RENDER =========================
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

  const getFlattenedAssignments = () => {
    if (!Array.isArray(assignments)) return [];

    return assignments.flatMap((a) => {
      if (Array.isArray(a.submissions) && a.submissions.length > 0) {
        return a.submissions.map((s, i) => ({
          id: s._id || `${a._id}-${i}`,
          assignmentId: a._id,
          studentId: s.studentId?._id || s.studentId || null,
          studentName: s.student?.fullName || "Unknown Student",
          title: a.title,
          description: a.description,
          grade: s.grade ?? "Not Graded",
          status: s.grade != null ? "Completed" : "Pending",
          isGraded: typeof s.grade === "number",
          dueDate: a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "N/A",
          submission: s,
          cohortId: a.cohortId?._id || null,
          cohortName: a.cohortId?.cohortName || "No Cohort",
        }));
      } else {
        return [
          {
            id: `${a._id}-no-submission`,
            assignmentId: a._id,
            studentId: null,
            studentName: "-",
            title: a.title,
            description: a.description,
            grade: "No submission",
            status: new Date(a.dueDate) < new Date() ? "Expired" : "Pending",
            isGraded: false,
            dueDate: a.dueDate
              ? new Date(a.dueDate).toLocaleDateString()
              : "N/A",
            submission: null,
            cohortId: a.cohortId?._id || null,
            cohortName: a.cohortId?.cohortName || "No Cohort",
          },
        ];
      }
    });
  };

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
            <form
              onSubmit={async (e) => {
                e.preventDefault();

                if (!videoTitle) return alert("Video title is required!");
                if (!videoFile) return alert("Please select a video file!");
                if (!classStartTime)
                  return alert("Class start time is required!");
                if (!selectedCourseId) return alert("Please select a course!");
                if (!selectedCohortId) return alert("Please select a cohort!");

                const utcTime = new Date(classStartTime).toISOString();

                const formData = new FormData();
                formData.append("title", videoTitle);
                formData.append("file", videoFile);
                formData.append("classStartTime", utcTime);
                formData.append("courseId", selectedCourseId);
                formData.append("cohortId", selectedCohortId);

                try {
                  setLoading(true);
                  const { data } = await axios.post(
                    `${BASE_URL}/api/coach/upload-video`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  setMessage(data.message);
                  setVideoTitle("");
                  setVideoFile(null);
                  setClassStartTime("");
                  setSelectedCourseId(courses[0]?._id || "");
                  setSelectedCohortId(cohorts[0]?.cohortId || "");
                  loadVideos();
                  await fetchMyVideos();
                } catch (err) {
                  console.error(err);
                  const errMsg =
                    err.response?.data?.message ||
                    err.message ||
                    "Upload failed";
                  setMessage(`❌ ${errMsg}`);
                } finally {
                  setLoading(false);
                }
              }}
            >
              {/* Video Title */}
              <TextField
                label="Video Title"
                fullWidth
                required
                sx={{ mb: 2 }}
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
              />

              {/* Class Start Time */}
              <TextField
                label="Class Start Time"
                type="datetime-local"
                fullWidth
                required
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
                value={classStartTime}
                onChange={(e) => setClassStartTime(e.target.value)}
              />

              {/* Course Selection */}
              <TextField
                label="Select Course"
                select
                fullWidth
                required
                sx={{ mb: 2 }}
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                {courses.length === 0 ? (
                  <MenuItem disabled>No courses available</MenuItem>
                ) : (
                  courses.map((course) => (
                    <MenuItem key={course._id} value={course._id}>
                      {course.name}
                    </MenuItem>
                  ))
                )}
              </TextField>

              {/* Cohort Selection */}
              <TextField
                label="Select Cohort"
                select
                fullWidth
                required
                sx={{ mb: 2 }}
                value={selectedCohortId}
                onChange={(e) => setSelectedCohortId(e.target.value)}
              >
                {cohorts.length === 0 ? (
                  <MenuItem disabled>No cohorts available</MenuItem>
                ) : (
                  cohorts.map((cohort) => (
                    <MenuItem key={cohort.cohortId} value={cohort.cohortId}>
                      {cohort.cohortName}
                    </MenuItem>
                  ))
                )}
              </TextField>

              {/* Buttons */}
              <Box
                sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}
              >
                <Button variant="contained" component="label">
                  Choose Video
                  <input
                    hidden
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setVideoFile(file);
                      } else {
                        setVideoFile(null);
                      }
                    }}
                  />
                </Button>
                {videoFile && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected: {videoFile.name}
                  </Typography>
                )}

                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : "Upload Video"}
                </Button>
              </Box>
            </form>

            {/* Messages */}
            {message && (
              <Typography
                variant="body1"
                color={message.includes("failed") ? "error" : "green"}
              >
                {message}
              </Typography>
            )}

            {/* My Uploaded Videos */}
            <Typography variant="h6">🎬 My Uploaded Videos</Typography>
            {Array.isArray(myVideos) && myVideos.length > 0 ? (
              myVideos.map((v) => (
                <Paper
                  key={v._id}
                  sx={{ p: 2, mt: 2, position: "relative", borderRadius: 2 }}
                >
                  <IconButton
                    sx={{ position: "absolute", top: 8, right: 8 }}
                    color="error"
                    onClick={() => handleDeleteVideo(v._id)}
                  >
                    <DeleteIcon />
                  </IconButton>

                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {v.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Course: {v.course?.name || "Unknown"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uploaded: {new Date(v.createdAt).toLocaleString()}
                  </Typography>
                  <video
                    src={v.fileUrl}
                    controls
                    style={{ width: "100%", borderRadius: 8, marginTop: 10 }}
                  />
                </Paper>
              ))
            ) : (
              <Typography sx={{ mt: 2 }}>No videos uploaded yet.</Typography>
            )}
          </Paper>
        )}

        {/* Upload Document */}
        {activeTab === "upload-doc" && (
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              📄 Upload Document
            </Typography>
            <form onSubmit={handleDocumentUpload}>
              {/* Document Title */}
              <TextField
                label="Document Title"
                fullWidth
                required
                sx={{ mb: 2 }}
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
              />

              {/* Unlock Date & Time */}
              <TextField
                label="Unlock Date & Time"
                type="datetime-local"
                fullWidth
                required
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
                value={unlockAt}
                onChange={(e) => setUnlockAt(e.target.value)}
              />

              {/* File Upload Button */}
              <Button
                variant="contained"
                component="label"
                fullWidth
                sx={{ mb: 2 }}
              >
                Choose Document
                <input
                  hidden
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setDocFile(e.target.files[0])}
                />
              </Button>
              {docFile && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Selected file: {docFile.name}
                </Typography>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || !docFile}
              >
                {loading ? <CircularProgress size={24} /> : "Upload Document"}
              </Button>
            </form>
          </Paper>
        )}
        {/* All Videos */}
        {/* {activeTab === "videos" && (
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
        )} */}
        {/* All Documents */}
        {/* {activeTab === "documents" && (
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
        )} */}
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
                "> .MuiTextField-root": { minWidth: 200 }, // remove flex: 1
              }}
            >
              <TextField
                select
                label="Select Cohort"
                value={selectedCohortId}
                onChange={(e) => setSelectedCohortId(e.target.value)}
                sx={{ minWidth: 250 }}
              >
                {(Array.isArray(cohorts) ? cohorts : []).map((c) => {
                  const cohortId = (
                    c._id ||
                    c.cohortId?._id ||
                    c.cohortId ||
                    ""
                  ).toString();
                  const cohortName = c.cohortName || "No Cohort";
                  return (
                    <MenuItem key={cohortId} value={cohortId}>
                      {cohortName}
                    </MenuItem>
                  );
                })}
              </TextField>
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
                disabled={!newTitle || !newDueDate || !selectedCohortId}
              >
                Create Assignment
              </Button>
            </Box>

            {/* Assignments Table */}

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
            ) : assignmentRows.length === 0 ? (
              <Typography>No assignments available yet.</Typography>
            ) : (
              <div style={{ height: 500, width: "100%" }}>
                <DataGrid
                  rows={
                    selectedCohortId
                      ? assignmentRows.filter(
                          (r) => r.cohortId === selectedCohortId
                        )
                      : assignmentRows
                  }
                  columns={[
                    { field: "cohortName", headerName: "Cohort", width: 180 },
                    { field: "studentName", headerName: "Student", width: 200 },
                    { field: "title", headerName: "Assignment", width: 250 },
                    {
                      field: "description",
                      headerName: "Description",
                      width: 300,
                    },
                    { field: "dueDate", headerName: "Due Date", width: 150 },
                    { field: "grade", headerName: "Grade", width: 120 },
                    { field: "status", headerName: "Status", width: 150 },
                    {
                      field: "actions",
                      headerName: "Actions",
                      width: 180,
                      renderCell: (params) => (
                        <Button
                          variant="contained"
                          size="small"
                          sx={{
                            bgcolor: params.row.isGraded
                              ? "#94a3b8"
                              : "#10b981",
                          }}
                          disabled={params.row.isGraded}
                          onClick={() =>
                            handleOpenAssignmentModal(
                              params.row,
                              params.row.submission
                            )
                          }
                        >
                          {params.row.isGraded ? "Graded" : "View & Grade"}
                        </Button>
                      ),
                    },
                  ]}
                  pageSize={5}
                />
              </div>
            )}

            {/* Assignments Grouped by Cohort */}
            {studentAssignmentsLoading || assignmentsLoading ? (
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
            ) : (!Array.isArray(studentAssignments) ||
                studentAssignments.length === 0) &&
              (!Array.isArray(assignments) || assignments.length === 0) ? (
              <Typography>No assignments available yet.</Typography>
            ) : (
              // Filter assignments by selectedCohortId
              (() => {
                const safeAssignments = Array.isArray(assignments)
                  ? assignments
                  : [];
                const filteredAssignments = selectedCohortId
                  ? safeAssignments.filter(
                      (a) => a.cohortId?._id === selectedCohortId
                    )
                  : safeAssignments; // if no cohort selected, show all

                return filteredAssignments.length === 0 ? (
                  <Typography>No assignments for this cohort.</Typography>
                ) : (
                  <div style={{ height: 500, width: "100%" }}>
                    <DataGrid
                      rows={filteredAssignments.flatMap((a) =>
                        Array.isArray(a.submissions) && a.submissions.length > 0
                          ? a.submissions.map((s, index) => {
                              const student = s?.studentId ?? {
                                fullName: "Unknown Student",
                                _id: null,
                              };
                              const studentName = student.fullName;
                              const gradeValue = s?.grade ?? null;

                              let status = "Pending";
                              if (gradeValue !== null) status = "Completed";
                              else if (new Date(a.dueDate) < new Date())
                                status = "Expired";

                              return {
                                id: s?._id || `${a._id}-${index}`,
                                assignmentId: a._id,
                                studentId: student?._id || null,
                                studentName,
                                title: a.title,
                                description: a.description,
                                grade:
                                  gradeValue !== null
                                    ? gradeValue
                                    : "Not Graded",
                                status,
                                isGraded:
                                  typeof gradeValue === "number" &&
                                  !Number.isNaN(gradeValue),
                                dueDate: a.dueDate
                                  ? new Date(a.dueDate).toLocaleDateString()
                                  : "N/A",
                                submission: s || null,
                              };
                            })
                          : [
                              {
                                id: `${a._id}-no-submission`,
                                assignmentId: a._id,
                                studentId: null,
                                studentName: "-",
                                title: a.title,
                                description: a.description,
                                grade: "No submission",
                                status:
                                  new Date(a.dueDate) < new Date()
                                    ? "Expired"
                                    : "Pending",
                                isGraded: false,
                                dueDate: a.dueDate
                                  ? new Date(a.dueDate).toLocaleDateString()
                                  : "N/A",
                                submission: null,
                              },
                            ]
                      )}
                      columns={[
                        {
                          field: "studentName",
                          headerName: "Student",
                          width: 200,
                        },
                        {
                          field: "title",
                          headerName: "Assignment",
                          width: 250,
                        },
                        {
                          field: "description",
                          headerName: "Description",
                          width: 300,
                        },
                        {
                          field: "dueDate",
                          headerName: "Due Date",
                          width: 150,
                        },
                        { field: "grade", headerName: "Grade", width: 120 },
                        { field: "status", headerName: "Status", width: 150 },
                        {
                          field: "actions",
                          headerName: "Actions",
                          width: 180,
                          renderCell: (params) => (
                            <Button
                              variant="contained"
                              size="small"
                              sx={{
                                bgcolor: params.row.isGraded
                                  ? "#94a3b8"
                                  : "#10b981",
                              }}
                              disabled={params.row.isGraded}
                              onClick={() =>
                                handleOpenAssignmentModal(
                                  safeAssignments.find(
                                    (a) => a._id === params.row.assignmentId
                                  ),
                                  params.row.submission
                                )
                              }
                            >
                              {params.row.isGraded ? "Graded" : "View & Grade"}
                            </Button>
                          ),
                        },
                      ]}
                      pageSize={5}
                      rowsPerPageOptions={[5]}
                    />
                  </div>
                );
              })()
            )}
            {/* Assignment Modal */}
            <Drawer
              anchor="right"
              open={openAssignmentModal}
              onClose={handleCloseAssignmentModal}
              PaperProps={{ sx: { width: { xs: "90%", md: 500 }, p: 3 } }}
            >
              {selectedAssignment && (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">Grade Assignment</Typography>
                    <IconButton onClick={handleCloseAssignmentModal}>
                      <CloseIcon />
                    </IconButton>
                  </Box>

                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    {selectedAssignment.title}
                  </Typography>

                  {selectedAssignment.submission?.file ? (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <a
                        href={selectedAssignment.submission.file}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Submitted Document
                      </a>
                    </Typography>
                  ) : (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      No submission available
                    </Typography>
                  )}

                  {selectedAssignment.submission?.grade != null ? (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      Grade: <b>{selectedAssignment.submission.grade}%</b>
                    </Alert>
                  ) : (
                    <TextField
                      label="Grade"
                      fullWidth
                      type="number"
                      value={gradeInput}
                      onChange={(e) => setGradeInput(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                  )}

                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    disabled={
                      gradingLoading ||
                      selectedAssignment.submission?.grade != null
                    }
                    onClick={() =>
                      submitGrade(
                        selectedAssignment.submission?.studentId ||
                          selectedAssignment.studentId
                      )
                    }
                  >
                    {gradingLoading ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Submit Grade"
                    )}
                  </Button>
                </>
              )}
            </Drawer>
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
                    id: s.studentId, // use studentId
                    fullName: s.fullName,
                    email: s.email,
                    phoneNumber: s.phoneNumber || "-", // fallback if missing
                    progress:
                      s.enrollments && s.enrollments.length > 0
                        ? `${s.enrollments.filter((e) => e.hasAccess).length}/${
                            s.enrollments.length
                          } courses`
                        : "0 courses", // simple progress
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
        {/* Start or End Course */}
        {activeTab === "course-control" && (
          <Paper sx={{ p: 4 }}>
            <Typography
              variant="h5"
              fontWeight="bold"
              color="green"
              gutterBottom
            >
              🎓 Start or End Your Assigned Course
            </Typography>

            {loadingAssigned ? (
              <CircularProgress />
            ) : (
              <>
                <TextField
                  select
                  label="Select Assignment"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  fullWidth
                >
                  {coursesArray.length === 0 ? (
                    <MenuItem disabled>No assigned courses</MenuItem>
                  ) : (
                    coursesArray.map((course) => (
                      <MenuItem
                        key={course.cohortCourseId}
                        value={course.cohortCourseId}
                      >
                        {course.cohortName} — {course.courseName} (
                        {course.status})
                      </MenuItem>
                    ))
                  )}
                </TextField>

                {selectedCourse &&
                  (() => {
                    const selected = coursesArray.find(
                      (c) => c.cohortCourseId === selectedCourse
                    );

                    return (
                      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={handleStartCourse}
                          disabled={
                            actionLoading || selected.status !== "pending"
                          }
                        >
                          {selected.status === "in_progress" ? (
                            "Course Started"
                          ) : actionLoading ? (
                            <CircularProgress size={22} />
                          ) : (
                            "Start Course"
                          )}
                        </Button>

                        <Button
                          variant="contained"
                          color="error"
                          onClick={handleEndCourse}
                          disabled={
                            actionLoading || selected.status !== "in_progress"
                          }
                        >
                          {selected.status === "completed" ? (
                            "Course Completed"
                          ) : actionLoading ? (
                            <CircularProgress size={22} />
                          ) : (
                            "End Course"
                          )}
                        </Button>
                      </Box>
                    );
                  })()}
              </>
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
