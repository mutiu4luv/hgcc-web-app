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
  Badge,
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
  Chat as ChatIcon,
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
const CHAT_SIDEBAR_WIDTH = 300;
const STORAGE_KEY = "classChats";

function ChatSidebarLocal({
  videos,
  documents,
  chatMessages,
  updateChatMessages,
  user,
}) {
  const [selected, setSelected] = useState(() => {
    if (Array.isArray(videos) && videos.length > 0)
      return { type: "video", id: videos[0]._id, title: videos[0].title };
    if (Array.isArray(documents) && documents.length > 0)
      return { type: "doc", id: documents[0]._id, title: documents[0].title };
    return null;
  });

  useEffect(() => {
    if (!selected) {
      if (videos?.length)
        setSelected({
          type: "video",
          id: videos[0]._id,
          title: videos[0].title,
        });
      else if (documents?.length)
        setSelected({
          type: "doc",
          id: documents[0]._id,
          title: documents[0].title,
        });
    } else {
      const exists =
        selected.type === "video"
          ? videos?.some((v) => v._id === selected.id)
          : documents?.some((d) => d._id === selected.id);
      if (!exists) {
        if (videos?.length)
          setSelected({
            type: "video",
            id: videos[0]._id,
            title: videos[0].title,
          });
        else if (documents?.length)
          setSelected({
            type: "doc",
            id: documents[0]._id,
            title: documents[0].title,
          });
        else setSelected(null);
      }
    }
  }, [videos, documents, selected]);

  const getCount = (type, id) => {
    return (
      (chatMessages[type] &&
        chatMessages[type][id] &&
        chatMessages[type][id].length) ||
      0
    );
  };

  const messagesForSelected = selected
    ? (chatMessages[selected.type] &&
        chatMessages[selected.type][selected.id]) ||
      []
    : [];

  const persist = (type, id, next) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const all = raw ? JSON.parse(raw) : { video: {}, doc: {} };
      all[type] = all[type] || {};
      all[type][id] = next;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      // same-tab update
      window.dispatchEvent(new CustomEvent("classChatsUpdated"));
    } catch (e) {
      console.warn("Failed to persist chats:", e);
    }
  };

  const sendMessage = (text, isCoach = true) => {
    if (!selected || !text?.trim()) return;
    const m = {
      sender: user?.fullName || user?.name || (isCoach ? "Coach" : "Student"),
      text: text.trim(),
      ts: new Date().toISOString(),
      isCoach: !!isCoach,
    };
    const next = [...(messagesForSelected || []), m];
    updateChatMessages(selected.type, selected.id, next);
    persist(selected.type, selected.id, next);
  };

  return (
    <Box
      sx={{
        width: CHAT_SIDEBAR_WIDTH,
        borderLeft: "1px solid rgba(0,0,0,0.08)",
        height: "100vh",
        position: "sticky",
        top: 0,
        bgcolor: "#fff",
        p: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="h6">Class Chats</Typography>
        <IconButton size="small">
          <ChatIcon />
        </IconButton>
      </Box>

      <Divider />

      <Typography sx={{ mt: 2, mb: 1, fontWeight: "bold" }}>Videos</Typography>
      <List dense sx={{ maxHeight: 180, overflowY: "auto" }}>
        {Array.isArray(videos) && videos.length > 0 ? (
          videos.map((v) => (
            <ListItemButton
              key={v._id}
              selected={selected?.type === "video" && selected?.id === v._id}
              onClick={() =>
                setSelected({ type: "video", id: v._id, title: v.title })
              }
            >
              <ListItemText
                primary={v.title}
                secondary={v.course?.name || ""}
              />
              <ListItemIcon>
                <Badge
                  color="primary"
                  badgeContent={getCount("video", v._id)}
                />
              </ListItemIcon>
            </ListItemButton>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>
            No video rooms
          </Typography>
        )}
      </List>

      <Typography sx={{ mt: 2, mb: 1, fontWeight: "bold" }}>
        Documents
      </Typography>
      <List dense sx={{ maxHeight: 140, overflowY: "auto" }}>
        {Array.isArray(documents) && documents.length > 0 ? (
          documents.map((d) => (
            <ListItemButton
              key={d._id}
              selected={selected?.type === "doc" && selected?.id === d._id}
              onClick={() =>
                setSelected({ type: "doc", id: d._id, title: d.title })
              }
            >
              <ListItemText
                primary={d.title}
                secondary={d.courseId?.name || ""}
              />
              <ListItemIcon>
                <Badge color="primary" badgeContent={getCount("doc", d._id)} />
              </ListItemIcon>
            </ListItemButton>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>
            No document rooms
          </Typography>
        )}
      </List>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {selected ? (
          <>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
              {selected.type === "video" ? "Video Chat" : "Document Chat"} —{" "}
              {selected.title || selected.id}
            </Typography>

            <Paper
              sx={{
                p: 2,
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  p: 1,
                  bgcolor: "#f7faf7",
                  borderRadius: 1,
                }}
              >
                {messagesForSelected.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No messages yet.
                  </Typography>
                ) : (
                  messagesForSelected.map((m, i) => (
                    <Box
                      key={i}
                      sx={{ mb: 0.6, textAlign: m.isCoach ? "right" : "left" }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          display: "inline-block",
                          p: 1,
                          borderRadius: 1,
                          bgcolor: m.isCoach ? "#d1e7dd" : "#fff",
                        }}
                      >
                        <strong>{m.sender}:</strong> {m.text}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>

              <ChatInput onSend={(text) => sendMessage(text, true)} />
            </Paper>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Select a room to open chat.
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/* small ChatInput component used inside the sidebar */
function ChatInput({ onSend }) {
  const [text, setText] = useState("");
  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSend(text);
            setText("");
          }
        }}
      />
      <Button
        variant="contained"
        onClick={() => {
          if (text.trim()) {
            onSend(text);
            setText("");
          }
        }}
      >
        Send
      </Button>
    </Box>
  );
}

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
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
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
  const [myDocuments, setMyDocuments] = useState([]);

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
  const CHAT_STORAGE_KEY = "coach_chat_open";

  const [chatOpen, setChatOpen] = useState(() => {
    return sessionStorage.getItem(CHAT_STORAGE_KEY) === "true";
  });

  useEffect(() => {
    sessionStorage.setItem(CHAT_STORAGE_KEY, chatOpen ? "true" : "false");
  }, [chatOpen]);

  const [chatMessages, setChatMessages] = useState(() => {
    const saved = localStorage.getItem("classChats");
    return saved ? JSON.parse(saved) : { video: {}, doc: {} };
  });
  const [newMessages, setNewMessages] = useState({});

  const studentName = "Student";
  const coachName = "Coach";

  const { cohortIds } = useParams();
  // console.log("COHORT ID FROM URL:", cohortId);
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

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        try {
          setChatMessages(JSON.parse(e.newValue || "{}"));
        } catch (err) {
          console.warn("Failed to parse classChats from storage event", err);
        }
      }
    };

    const handleCustom = () => {
      try {
        setChatMessages(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
      } catch (err) {
        console.warn("Failed to parse classChats from localStorage", err);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("classChatsUpdated", handleCustom);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("classChatsUpdated", handleCustom);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chatMessages));
    } catch (e) {
      console.warn("Failed to save chats to localStorage:", e);
    }
  }, [chatMessages]);

  const updateChatMessages = (type, id, msgs) => {
    setChatMessages((prev) => {
      const next = { ...(prev || { video: {}, doc: {} }) };
      next[type] = { ...(next[type] || {}) };
      next[type][id] = msgs;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent("classChatsUpdated"));
      } catch (e) {
        console.warn("Failed to persist classChats:", e);
      }
      return next;
    });
  };

  // helper to update parent chatMessages state

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!docFile || !docTitle || !unlockAt) return;

    setLoading(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("title", docTitle);
    formData.append("courseId", selectedCourseId);
    formData.append("unlockAt", unlockAt);
    formData.append("file", docFile);
    // ✅ required field

    try {
      const res = await fetch(`${BASE_URL}/api/coach/upload-document`, {
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
    } catch (error) {
      console.error("Failed to load videos", error);
      setMyVideos([]); // prevent map crash
    }
  };

  useEffect(() => {
    fetchMyVideos();
  }, []);

  // DELETE DOCUMENT
  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;

    try {
      await axios.delete(`${BASE_URL}/api/coach/document/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove from UI
      setMyDocuments((prev) => prev.filter((doc) => doc._id !== documentId));
      alert("Document deleted successfully");
    } catch (err) {
      console.error("❌ Error deleting document:", err);
      alert("Failed to delete document");
    }
  };
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

      console.log("Assigned courses from API:", res.data);
      setAssignedCourses(res.data.cohorts || []);
    } catch (err) {
      console.error("Error fetching assigned courses:", err);
    } finally {
      setLoadingAssigned(false);
    }
  };

  // =========================
  // FLATTEN COURSES FOR DROPDOWN
  // =========================
  useEffect(() => {
    if (!assignedCourses || assignedCourses.length === 0) {
      setCoursesArray([]);
      return;
    }

    // Transform assignedCourses into flat array for dropdown

    const flatCourses = assignedCourses.flatMap((cohort) =>
      cohort.courses.map((course) => ({
        cohortCourseId: course.cohortCourseId,
        courseId: course.courseId,
        courseName: course.name,
        cohortName: cohort.cohortName,
        status: course.status,
      }))
    );
    //

    setCoursesArray(flatCourses);
  }, [assignedCourses]);
  // auto-select first course when coursesArray changes
  useEffect(() => {
    if (coursesArray.length > 0 && !selectedCourse) {
      setSelectedCourse(coursesArray[0].cohortCourseId);
    }
  }, [coursesArray]);
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
  // const loadStudentAssignments = async () => {
  //   setStudentAssignmentsLoading(true);
  //   try {
  //     const res = await axios.get(`${BASE_URL}/api/assignment/student/`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     setStudentAssignments(res.data.assignments || []);
  //   } catch (err) {
  //     console.error(
  //       "Error fetching student assignments:",
  //       err?.response?.data || err
  //     );
  //     setMessage("Failed to load student assignments");
  //   } finally {
  //     setStudentAssignmentsLoading(false);
  //   }
  // };
  // useEffect(() => {
  //   loadStudentAssignments();
  // }, []);

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

  const fetchMyDocuments = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/coach/my-documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMyDocuments(data.unlockedMaterials || []);
    } catch (err) {
      console.error("❌ Error fetching coach documents:", err);
    }
  };
  useEffect(() => {
    loadVideos();
    fetchMyDocuments();
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

  // ========================= // FETCH ASSIGNMENTS SUBMISSIONS // =========================
  const loadAssignments = async () => {
    setAssignmentsLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/assignment/coach-assignments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
        setCourses(data.courses || []);
      } catch (error) {
        console.error("Failed to load courses:", error);
      }
    };

    loadCourses();
  }, []);

  // Fetch courses in cohort
  // const loadCohortCourses = async () => {
  //   try {
  //     const res = await axios.get(
  //       `${BASE_URL}/api/cohort/${cohortId}/courses`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     setCohortCourses(res.data.courses || []);
  //   } catch (err) {
  //     console.error("Failed loading cohort courses:", err);
  //   }
  // };

  useEffect(() => {
    loadAssignments();
    // loadCohortCourses();
  }, [BASE_URL, token, cohortId]);

  // ========================= // ASSIGNMENTS TAB =========================

  const assignmentRows = Object.values(assignments || {})
    .flat()
    .flatMap((a) => {
      // CASE 1 — assignment has submissions
      if (Array.isArray(a.submissions) && a.submissions.length > 0) {
        return a.submissions.map((s, idx) => ({
          id: `${a._id}-${s.studentId?._id || idx}`,
          assignmentId: a._id,
          title: a.title,
          description: a.description,
          cohortId: a.cohortId?._id,
          cohortName: a.cohortId?.name || "No Cohort",
          studentId: s.studentId?._id,
          studentName: s.studentId?.fullName || "Unknown",
          grade: s.grade ?? "Not Graded",
          isGraded: s.grade != null,
          status: s.grade != null ? "Completed" : "Pending",
          dueDate: a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "N/A",
          submission: s,
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
          cohortName: a.cohortId?.name || "No Cohort",
          studentId: null,
          studentName: "-",
          grade: "No submission",
          isGraded: false,
          status: new Date(a.dueDate) < new Date() ? "Expired" : "Pending",
          dueDate: a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "N/A",
          submission: null,
        },
      ];
    });

  // console.log("RAW assignments:", assignments);
  // console.log("assignmentRows:", assignmentRows);

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

      {/* Chat Button */}
      <IconButton
        onClick={() => setChatOpen(true)}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          bgcolor: "#10b981",
          color: "#fff",
          zIndex: 1600,
          boxShadow: 4,
          "&:hover": { bgcolor: "#059669" },
        }}
      >
        💬
      </IconButton>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          minHeight: "100vh",
          overflow: "visible",
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: { xs: 2, md: 4 },
            bgcolor: "#f9fafb",
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
                            key={i}
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
                  if (!selectedCourseId)
                    return alert("Please select a course!");
                  if (!selectedCohortId)
                    return alert("Please select a cohort!");

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
                <TextField
                  label="Video Title"
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                />
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

                <Box
                  sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}
                >
                  <Button variant="contained" component="label">
                    Choose Video
                    <input
                      hidden
                      type="file"
                      accept="video/*"
                      onChange={(e) => setVideoFile(e.target.files[0] || null)}
                    />
                  </Button>
                  {videoFile && (
                    <Typography sx={{ mt: 1 }}>
                      Selected: {videoFile.name}
                    </Typography>
                  )}

                  <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : "Upload Video"}
                  </Button>
                </Box>
              </form>

              {message && (
                <Typography
                  color={message.includes("failed") ? "error" : "green"}
                >
                  {message}
                </Typography>
              )}

              <Typography variant="h6">🎬 My Uploaded Videos</Typography>
              {Array.isArray(myVideos) && myVideos.length > 0 ? (
                myVideos.map((video) => {
                  const unlockAt = new Date(
                    video.classStartTime || video.createdAt
                  );
                  const expireTime = new Date(
                    unlockAt.getTime() + 3 * 60 * 60 * 1000
                  );
                  const isUnlocked =
                    new Date() >= unlockAt && new Date() <= expireTime;

                  // Load chat messages from localStorage
                  // place this inside myVideos.map(video => { ... }) where you render each video
                  {
                    videos.map((video) => {
                      const videoChat =
                        (chatMessages.video && chatMessages.video[video._id]) ||
                        [];

                      return (
                        <Paper
                          key={video._id}
                          sx={{
                            p: 2,
                            mt: 2,
                            position: "relative",
                            borderRadius: 2,
                          }}
                        >
                          {/* VIDEO DETAILS */}
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: "bold" }}
                          >
                            {video.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Course: {video.course?.name || "Unknown"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Uploaded:{" "}
                            {new Date(video.createdAt).toLocaleString()}
                          </Typography>

                          <video
                            src={video.fileUrl}
                            controls
                            style={{
                              width: "100%",
                              borderRadius: 8,
                              marginTop: 10,
                            }}
                          />

                          {/* ✅ PLACE STUDENT–COACH CHAT HERE */}
                          <Paper sx={{ p: 2, mt: 2, bgcolor: "#e8f5e9" }}>
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              sx={{ mb: 1 }}
                            >
                              💬 Class Chat (Video)
                            </Typography>

                            <Box
                              sx={{
                                maxHeight: 200,
                                overflowY: "auto",
                                mb: 1,
                                p: 1,
                                bgcolor: "#f1f8e9",
                                borderRadius: 1,
                              }}
                            >
                              {videoChat.length === 0 ? (
                                <Typography
                                  variant="body2"
                                  sx={{ color: "gray" }}
                                >
                                  No messages yet.
                                </Typography>
                              ) : (
                                videoChat.map((msg, idx) => (
                                  <Box
                                    key={idx}
                                    sx={{
                                      textAlign:
                                        msg.senderId === studentId
                                          ? "right"
                                          : "left",
                                      mb: 0.5,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        display: "inline-block",
                                        p: 1,
                                        borderRadius: 1,
                                        bgcolor:
                                          msg.senderId === studentId
                                            ? "#d1e7dd"
                                            : "#fff",
                                      }}
                                    >
                                      <strong>{msg.senderName}:</strong>{" "}
                                      {msg.text}
                                    </Typography>
                                  </Box>
                                ))
                              )}
                            </Box>

                            {/* CHAT INPUT */}
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <TextField
                                fullWidth
                                size="small"
                                placeholder="Type a message..."
                                value={newMessages[video._id] || ""}
                                onChange={(e) =>
                                  setNewMessages((prev) => ({
                                    ...prev,
                                    [video._id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    const text = (
                                      newMessages[video._id] || ""
                                    ).trim();
                                    if (text)
                                      sendStudentMessage(
                                        "video",
                                        video._id,
                                        text
                                      );
                                  }
                                }}
                              />
                              <Button
                                variant="contained"
                                onClick={() => {
                                  const text = (
                                    newMessages[video._id] || ""
                                  ).trim();
                                  if (text)
                                    sendStudentMessage(
                                      "video",
                                      video._id,
                                      text
                                    );
                                }}
                              >
                                Send
                              </Button>
                            </Box>
                          </Paper>
                          {/* END CHAT */}
                        </Paper>
                      );
                    });
                  }

                  const [videoMessage, setVideoMessage] = React.useState("");
                  const [videoChatState, setVideoChatState] =
                    React.useState(videoChat);

                  const sendVideoChat = (vidId) => {
                    if (!videoMessage.trim()) return;
                    const newMsg = { sender: studentName, text: videoMessage };
                    const updatedChat = [...videoChatState, newMsg];
                    setVideoChatState(updatedChat);
                    setVideoMessage("");

                    // Save to localStorage
                    const allChats = JSON.parse(
                      localStorage.getItem("chatMessages")
                    ) || { video: {}, doc: {} };
                    allChats.video[vidId] = updatedChat;
                    localStorage.setItem(
                      "chatMessages",
                      JSON.stringify(allChats)
                    );
                  };

                  return (
                    <Paper
                      key={video._id}
                      sx={{
                        p: 2,
                        mt: 2,
                        position: "relative",
                        borderRadius: 2,
                      }}
                    >
                      <IconButton
                        sx={{ position: "absolute", top: 8, right: 8 }}
                        color="error"
                        onClick={() => handleDeleteVideo(video._id)}
                      >
                        <DeleteIcon />
                      </IconButton>

                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold" }}
                      >
                        {video.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Course: {video.course?.name || "Unknown"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Uploaded: {new Date(video.createdAt).toLocaleString()}
                      </Typography>
                      <video
                        src={video.fileUrl}
                        controls
                        style={{
                          width: "100%",
                          borderRadius: 8,
                          marginTop: 10,
                        }}
                      />

                      <Paper sx={{ p: 2, mt: 2, bgcolor: "#e8f5e9" }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{ mb: 1 }}
                        >
                          💬 Class Chat (Video)
                        </Typography>

                        <Box
                          id={`chat-box-video-${video._id}`}
                          sx={{
                            maxHeight: 200,
                            overflowY: "auto",
                            mb: 1,
                            p: 1,
                            bgcolor: "#f1f8e9",
                            borderRadius: 1,
                          }}
                        >
                          {videoChatState.length === 0 ? (
                            <Typography variant="body2" sx={{ color: "gray" }}>
                              No messages yet. Say hi 👋
                            </Typography>
                          ) : (
                            videoChatState.map((msg, idx) => (
                              <Box
                                key={idx}
                                sx={{
                                  textAlign:
                                    msg.sender === studentName
                                      ? "right"
                                      : "left",
                                  mb: 0.5,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    display: "inline-block",
                                    p: 1,
                                    borderRadius: 1,
                                    bgcolor:
                                      msg.sender === studentName
                                        ? "#d1e7dd"
                                        : "#fff",
                                  }}
                                >
                                  <strong>{msg.sender}:</strong> {msg.text}
                                </Typography>
                              </Box>
                            ))
                          )}
                        </Box>

                        <Box sx={{ display: "flex", gap: 1 }}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Type a message..."
                            value={videoMessage}
                            onChange={(e) => setVideoMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") sendVideoChat(video._id);
                            }}
                          />
                          <Button
                            variant="contained"
                            onClick={() => sendVideoChat(video._id)}
                          >
                            Send
                          </Button>
                        </Box>
                      </Paper>
                    </Paper>
                  );
                })
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

                {/* Select Course */}
                <TextField
                  select
                  label="Select Course"
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                >
                  {courses.map((course) => (
                    <MenuItem key={course._id} value={course._id}>
                      {course.name}
                    </MenuItem>
                  ))}
                </TextField>

                {/* File Upload Button */}
                <Button
                  variant="contained"
                  component="label"
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Choose Document (PDF, DOC, DOCX)
                  <input
                    hidden
                    type="file"
                    accept="
                        .pdf,application/pdf,
                        .doc,application/msword,
                        .docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document
                    "
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      const allowedTypes = [
                        "application/pdf",
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                      ];

                      if (!allowedTypes.includes(file.type)) {
                        alert("❌ Only PDF, DOC, and DOCX files are allowed.");
                        e.target.value = "";
                        return;
                      }

                      setDocFile(file);
                    }}
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

              {/* Display uploaded documents */}
              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                📚 My Uploaded Documents
              </Typography>

              {myDocuments.length === 0 ? (
                <Typography>No documents uploaded yet.</Typography>
              ) : (
                myDocuments.map((doc) => (
                  <Paper
                    key={doc._id}
                    sx={{ p: 2, mb: 2, position: "relative" }}
                  >
                    {/* Delete Icon */}
                    <IconButton
                      sx={{ position: "absolute", top: 8, right: 8 }}
                      onClick={() => handleDeleteDocument(doc._id)}
                    >
                      <Delete color="error" />
                    </IconButton>

                    <Typography variant="subtitle1" fontWeight="bold">
                      {doc.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Course:{" "}
                      {doc.courseId?.name || doc.course?.name || "Unknown"}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Unlocks: {new Date(doc.unlockAt).toLocaleString()}
                    </Typography>

                    <Button
                      variant="outlined"
                      sx={{ mt: 1 }}
                      href={doc.fileUrl}
                      target="_blank"
                    >
                      View Document
                    </Button>
                  </Paper>
                ))
              )}
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
                      {
                        field: "studentName",
                        headerName: "Student",
                        width: 200,
                      },
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
                          Array.isArray(a.submissions) &&
                          a.submissions.length > 0
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
                                {params.row.isGraded
                                  ? "Graded"
                                  : "View & Grade"}
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
                      onClick={async () => {
                        await submitGrade(
                          selectedAssignment.submission?.studentId ||
                            selectedAssignment.studentId
                        );
                        // Refresh assignments instantly after grading
                        await loadAssignments();
                      }}
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
                <Typography>
                  No students enrolled in your courses yet.
                </Typography>
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
                          ? `${
                              s.enrollments.filter((e) => e.hasAccess).length
                            }/${s.enrollments.length} courses`
                          : "0 courses", // simple progress
                    }))}
                    columns={[
                      {
                        field: "fullName",
                        headerName: "Full Name",
                        width: 250,
                      },
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
                    label="Select Assigned Course"
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

                  {selectedCourse && (
                    <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handleStartCourse}
                        disabled={
                          actionLoading ||
                          coursesArray.find(
                            (c) => c.cohortCourseId === selectedCourse
                          )?.status !== "not_started"
                        }
                      >
                        {actionLoading ? (
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
                          actionLoading ||
                          coursesArray.find(
                            (c) => c.cohortCourseId === selectedCourse
                          )?.status !== "in_progress"
                        }
                      >
                        {actionLoading ? (
                          <CircularProgress size={22} />
                        ) : (
                          "End Course"
                        )}
                      </Button>
                    </Box>
                  )}
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
                coaching sessions, interact with students in real time, and
                manage ongoing sessions.
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
        {!isMobile && (
          <Box
            sx={{
              width: chatOpen ? CHAT_SIDEBAR_WIDTH : 0,
              height: "100vh",
              borderLeft: chatOpen ? "1px solid #e5e7eb" : "none",
              bgcolor: "#ffffff",
              overflow: "hidden",
              transition: "width 0.3s ease",
              flexShrink: 0,
            }}
          >
            {chatOpen && (
              <ChatSidebarLocal
                videos={myVideos}
                documents={myDocuments}
                chatMessages={chatMessages}
                updateChatMessages={updateChatMessages}
                user={user}
                onClose={() => setChatOpen(false)}
              />
            )}
          </Box>
        )}
      </Box>
      <Drawer
        anchor="right"
        open={isMobile && chatOpen}
        onClose={() => setChatOpen(false)}
        PaperProps={{
          sx: {
            width: "85%",
            maxWidth: 360,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography fontWeight="bold">💬 Chat</Typography>
            <IconButton onClick={() => setChatOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <ChatSidebarLocal
            videos={myVideos}
            documents={myDocuments}
            chatMessages={chatMessages}
            updateChatMessages={updateChatMessages}
            user={user}
          />
        </Box>
      </Drawer>
    </Box>
  );
};

export default CoachDashboard;
