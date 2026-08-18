import React, { useState, useEffect, useRef } from "react";
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
  FormControl,
  InputLabel,
  Select,
  Stack,
  Pagination,
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
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { useInView } from "react-intersection-observer";
import GlobalChatPanel from "../Component/GlobalChatPanel";
import MobileBottomNav from "../Component/MobileBottomNav";

const drawerWidth = 250;
const CHAT_SIDEBAR_WIDTH = 300;
const STORAGE_KEY = "classChats";
const BASE_URL = import.meta.env.VITE_BASE_URL;
const ASSIGNMENTS_PER_PAGE = 20;

const toAssignmentExpiry = (dateValue) => {
  if (!dateValue) return "";

  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(year, month - 1, day, 23, 59, 0, 0).toISOString();
};

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const normalizeAssignedCohorts = (value) =>
  ensureArray(value)
    .filter(Boolean)
    .map((cohort) => ({
      ...cohort,
      cohortId:
        cohort?._id ||
        cohort?.cohortId?._id ||
        cohort?.cohortId ||
        "",
      cohortName:
        cohort?.cohortName ||
        cohort?.name ||
        cohort?.cohortId?.name ||
        "No Cohort",
      courses: ensureArray(cohort?.courses)
        .filter(Boolean)
        .map((course) => ({
          ...course,
          cohortCourseId: course?.cohortCourseId || "",
          courseId:
            typeof course?.courseId === "object"
              ? course?.courseId?._id || ""
              : course?.courseId || "",
          name: course?.name || course?.courseId?.name || "Untitled Course",
        }))
        .filter((course) => course.cohortCourseId && course.courseId),
    }));

const getEntityId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

const normalizeCoachOwnedCourses = (value) =>
  ensureArray(value)
    .filter(Boolean)
    .map((course) => ({
      courseId: getEntityId(course?._id || course?.courseId),
      name: course?.name || "Untitled Course",
      cohortId: "",
      cohortName: "No Cohort",
    }))
    .filter((course) => course.courseId);

const safeParseJSON = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeRatings = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.ratings)) return value.ratings;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

function ChatSidebarLocal({
  cohortId,
  courseId,
  videos,
  documents,
  user,
  chatMessages,
  updateChatMessages,
  setMessages,
  socketRef,
  messages,
  openChat,
  unreadCount,
}) {
  const [selected, setSelected] = useState(() => {
    if (Array.isArray(videos) && videos.length > 0)
      return { type: "video", id: videos[0]._id, title: videos[0].title };
    if (Array.isArray(documents) && documents.length > 0)
      return { type: "doc", id: documents[0]._id, title: documents[0].title };
    return null;
  });
  const bottomRef = useRef(null);
  const resolvedCourseId = React.useMemo(() => {
    if (!selected) return null;

    if (selected.type === "video") {
      const v = videos?.find((v) => v._id === selected.id);
      return typeof v?.course === "object" ? v.course._id : v?.course;
    }

    if (selected.type === "doc") {
      const d = documents?.find((d) => d._id === selected.id);
      return typeof d?.courseId === "object" ? d.courseId._id : d?.courseId;
    }

    return null;
  }, [selected, videos, documents]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const myId = user?._id || user?.id;

  const isMyMessage = (msg) => {
    const senderId =
      typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;

    return senderId === myId;
  };

  const getSenderName = (msg) => {
    if (isMyMessage(msg)) return "You";

    if (typeof msg.senderId === "object") {
      return msg.senderId.fullName;
    }

    return "Student";
  };
  // AUTO-SELECT FIRST ROOM IF NONE SELECTED
  useEffect(() => {
    if (!selected) {
      if (videos?.length > 0) {
        setSelected({
          type: "video",
          id: videos[0]._id,
          title: videos[0].title,
        });
        return;
      }

      if (documents?.length > 0) {
        setSelected({
          type: "doc",
          id: documents[0]._id,
          title: documents[0].title,
        });
      }
    }
  }, [videos, documents]);

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

  // Send cohort chat message

  const sendMessage = async (text) => {
    if (!text?.trim()) return;

    if (!cohortId || !resolvedCourseId) {
      console.warn("Chat not ready yet", { cohortId, resolvedCourseId });
      return;
    }

    const token = localStorage.getItem("token");

    const res = await fetch(
      `${BASE_URL}/api/cohort-chat/${cohortId}/${resolvedCourseId}/message`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      }
    );

    if (!res.ok) {
      console.error(await res.text());
      return;
    }

    const savedMessage = await res.json();
    setMessages((prev) => [...prev, savedMessage]);
  };

  // Fetch cohort chat messages

  useEffect(() => {
    if (!cohortId || !resolvedCourseId) return;

    const token = localStorage.getItem("token");

    fetch(
      `${BASE_URL}/api/cohort-chat/${cohortId}/${resolvedCourseId}/message`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setMessages(Array.isArray(data.messages) ? data.messages : []);
      })
      .catch(console.error);
  }, [cohortId, resolvedCourseId]);

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
        <IconButton onClick={openChat}>
          <Badge
            badgeContent={unreadCount}
            color="error"
            invisible={unreadCount === 0}
          >
            <ChatIcon />
          </Badge>
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
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Paper
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {/* MESSAGES */}
                <Box
                  sx={{
                    flex: 1,
                    overflowY: "auto",
                    p: 1,
                    bgcolor: "#f7faf7",
                  }}
                >
                  {messages.map((msg, i) => {
                    const mine = isMyMessage(msg);

                    return (
                      <Box
                        key={msg._id || i}
                        sx={{
                          display: "flex",
                          justifyContent: mine ? "flex-end" : "flex-start",
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: "70%",
                            width: "fit-content",
                            p: 1.2,
                            borderRadius: 2,
                            bgcolor: mine ? "#dbeafe" : "#ffffff",
                            boxShadow: 1,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: "bold",
                              display: "block",
                              mb: 0.3,
                            }}
                          >
                            {getSenderName(msg)}
                          </Typography>

                          <Typography variant="body2">{msg.text}</Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
                <div ref={bottomRef} />

                {/* INPUT (ALWAYS VISIBLE) */}
                <Box
                  sx={{
                    borderTop: "1px solid #e0e0e0",
                    p: 1,
                    bgcolor: "#fff",
                    flexShrink: 0,
                  }}
                >
                  <ChatInput
                    onSend={sendMessage}
                    disabled={!cohortId || !resolvedCourseId}
                  />
                </Box>
              </Paper>
            </Box>
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

function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState("");

  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <TextField
        fullWidth
        size="small"
        disabled={disabled}
        placeholder={
          disabled ? "Select a class to start chatting" : "Type a message..."
        }
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !disabled) {
            onSend(text);
            setText("");
          }
        }}
      />
      <Button
        variant="contained"
        disabled={disabled}
        onClick={() => {
          if (!disabled && text.trim()) {
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
  const { cohortIds } = useParams();
  const { courseId } = useParams();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [videoUploadFeedback, setVideoUploadFeedback] = useState(null);
  const [savedMessage, setSavedMessage] = useState(null);
  const [messages, setMessages] = useState([]);

  const [videoTitle, setVideoTitle] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videos, setVideos] = useState([]);

  const [docTitle, setDocTitle] = useState("");
  const [docFile, setDocFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [classStartTime, setClassStartTime] = useState("");
  const [courses, setCourses] = useState([]);

  const [assignments, setAssignments] = useState([]);
  const [assignmentSummaries, setAssignmentSummaries] = useState([]);
  const [assignmentPage, setAssignmentPage] = useState(1);
  const [students, setStudents] = useState([]);
  const [ratingData, setRatingData] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [creatingAssignment, setCreatingAssignment] = useState(false);
  const [editDueDate, setEditDueDate] = useState("");
  const [updatingDueDate, setUpdatingDueDate] = useState(false);

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
  const [selected, setSelected] = useState("");

  const [myVideos, setMyVideos] = useState([]);
  const [unlockAt, setUnlockAt] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [meetLink, setMeetLink] = useState("");
  const [startingLive, setStartingLive] = useState(false);
  const [endingLive, setEndingLive] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const activeTabRef = useRef(activeTab);
  const [openGroupChatChannel, setOpenGroupChatChannel] = useState("coaches");
  const [chatUnreadByChannel, setChatUnreadByChannel] = useState({
    students: 0,
    coaches: 0,
  });

  const safeAssignedCourses = React.useMemo(
    () => normalizeAssignedCohorts(assignedCourses),
    [assignedCourses]
  );
  const uploadCohorts = React.useMemo(
    () =>
      safeAssignedCourses.filter(
        (cohort) => Array.isArray(cohort.courses) && cohort.courses.length > 0
      ),
    [safeAssignedCourses]
  );
  const uploadCoursesForSelectedCohort = React.useMemo(
    () =>
      uploadCohorts.find((cohort) => cohort.cohortId === selectedCohortId)
        ?.courses || [],
    [uploadCohorts, selectedCohortId]
  );

  const [contentType, setContentType] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [slContents, setSlContents] = useState([]);
  const [slLoading, setSlLoading] = useState(false);

  const [selfLearningCourses, setSelfLearningCourses] = useState([]);
  const [selectedSelfLearningCourseId, setSelectedSelfLearningCourseId] =
    useState("");
  const [selfLearningLoading, setSelfLearningLoading] = useState(false);
  const [slError, setSlError] = useState("");

  const buildVideoUploadFeedback = (error) => {
    const status = error?.response?.status;
    const serverMessage = error?.response?.data?.message;
    const fallbackMessage = error?.message || "Upload failed";

    if (status === 400 && serverMessage) {
      return {
        severity: "warning",
        title: "Upload needs attention",
        detail: serverMessage,
      };
    }

    if (status === 403) {
      return {
        severity: "error",
        title: "Upload not allowed",
        detail:
          serverMessage ||
          "This coach is not assigned to the selected course and cohort.",
      };
    }

    if (status === 404) {
      return {
        severity: "error",
        title: "Course setup issue",
        detail: serverMessage || "The selected course could not be found.",
      };
    }

    if (!error?.response) {
      return {
        severity: "error",
        title: "Network or server issue",
        detail:
          "The upload could not reach the server. Please check your connection and try again.",
      };
    }

    return {
      severity: "error",
      title: "Video upload failed",
      detail: serverMessage || fallbackMessage,
    };
  };

  const [freeContentType, setFreeContentType] = useState("");
  const [freeTitle, setFreeTitle] = useState("");
  const [freeFile, setFreeFile] = useState(null);
  const [freeUrl, setFreeUrl] = useState("");
  const [selectedFreeCourseId, setSelectedFreeCourseId] = useState("");
  const [freeCourses, setFreeCourses] = useState([]);
  const [freeContents, setFreeContents] = useState([]);
  const [loadingFreeContent, setLoadingFreeContent] = useState(false);

  const CHAT_STORAGE_KEY = "coach_chat_open";
  const user = safeParseJSON(localStorage.getItem("user"), {});

  const studentId = user?._id || user?.id;
  const studentName = user?.name || user?.fullName || "Coach";

  const LazyVideoWrapper = ({ children }) => {
    const { ref, inView } = useInView({
      triggerOnce: true,
      rootMargin: "300px",
    });

    return (
      <div ref={ref} style={{ minHeight: 120 }}>
        {inView ? children : <Typography>Loading video...</Typography>}
      </div>
    );
  };

  // fetch courses for selected cohort (for live class)
  useEffect(() => {
    if (!cohortId) {
      setCoursesArray([]);
      return;
    }
    const fetchCourses = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/course/${cohortId}/courses-for-coach`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCoursesArray(res.data.courses || []);

        console.log("live class courses:", res.data.courses);
      } catch (err) {
        setCoursesArray([]);
      }
    };
    fetchCourses();
  }, [cohortId]);

  // fetch Coaches free courses

  const fetchMyFreeCourses = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/free-learning/free-courses/coach/my`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFreeCourses(res.data.courses || []);
      console.log(res);
    } catch {
      toast.error("Failed to load your free courses");
    }
  };
  // 🔹 Fetch coach contents for selected free course
  const fetchFreeCourseContents = async () => {
    if (!selectedFreeCourseId) return;

    try {
      setLoadingFreeContent(true);

      const res = await axios.get(
        `${BASE_URL}/api/free-learning/free-courses/${selectedFreeCourseId}/contents/coach`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFreeContents(res.data.contents || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load contents");
    } finally {
      setLoadingFreeContent(false);
    }
  };

  // auto reload
  useEffect(() => {
    if (activeTab === "upload-free-learning-doc") {
      fetchMyFreeCourses();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchFreeCourseContents();
  }, [selectedFreeCourseId]);

  useEffect(() => {
    if (activeTab === "upload-free-learning-doc") {
      fetchMyFreeCourses();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedFreeCourseId) {
      fetchFreeCourseContents();
    }
  }, [selectedFreeCourseId]);

  // FETCH SELF LEARNING COURSE CONTENT (DOCUMENTS)

  const fetchMyCourseContent = async () => {
    if (!selectedSelfLearningCourseId) return;

    try {
      setSlLoading(true);
      setSlError("");

      const { data } = await axios.get(
        `${BASE_URL}/api/self-learning/course/${selectedSelfLearningCourseId}/content`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ fetched content:", data.contents);
      setSlContents(data.contents || []);
    } catch (err) {
      console.error("❌ Failed to fetch content", err);

      const message =
        err.response?.data?.message || "Failed to load course content";

      setSlError(message);
      setSlContents([]);
    } finally {
      setSlLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSelfLearningCourseId) {
      fetchMyCourseContent();
    }
  }, [selectedSelfLearningCourseId]);

  useEffect(() => {
    if (activeTab === "upload-sl-doc") {
      fetchSelfLearningCourses();
    }
  }, [activeTab]);

  // delete content for self learning
  const handleDeleteContent = async (id) => {
    if (!window.confirm("Delete this content?")) return;

    await axios.delete(`${BASE_URL}/api/self-learning/content/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchMyCourseContent();
  };

  // fetch self learning courses

  const fetchSelfLearningCourses = async () => {
    try {
      setSelfLearningLoading(true);

      const { data } = await axios.get(
        `${BASE_URL}/api/self-learning/courses`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // backend may return { courses } or array
      const list = Array.isArray(data) ? data : data.courses || [];
      setSelfLearningCourses(list);

      // auto-select first course
      if (list.length && !selectedSelfLearningCourseId) {
        setSelectedSelfLearningCourseId(list[0]._id);
      }
    } catch (err) {
      console.error("Failed to fetch self-learning courses", err);
    } finally {
      setSelfLearningLoading(false);
    }
  };
  useEffect(() => {
    if (activeTab === "upload-sl-doc") {
      fetchSelfLearningCourses();
    }
  }, [activeTab]);
  // Start live class
  const startLiveVideo = async () => {
    if (!cohortId || !selectedCourse) {
      toast.error("Cohort or course not selected");
      return;
    }

    if (!meetLink.trim()) {
      toast.error("Please provide a Google Meet link");
      return;
    }

    if (!token) {
      toast.error("Session expired. Please log in again.");
      return;
    }

    // ✅ Normalize Google Meet URL
    let url = meetLink.trim();
    if (!/^https?:\/\//.test(url)) {
      url = `https://${url}`;
    }

    try {
      setStartingLive(true);

      await axios.post(
        `${BASE_URL}/api/live/${cohortId}/${selectedCourse}`,
        { meetLink: url },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Live class started successfully ✅");

      // ✅ Open Google Meet in a new tab
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Live start failed:", err);

      toast.error(
        err.response?.data?.message ||
          "Failed to start live class. Please try again."
      );
    } finally {
      setStartingLive(false);
    }
  };

  const endLiveVideo = async () => {
    if (!cohortId || !selectedCourse) {
      toast.error("Cohort or course not selected");
      return;
    }

    if (!token) {
      toast.error("Session expired. Please log in again.");
      return;
    }

    try {
      setEndingLive(true);
      await axios.patch(
        `${BASE_URL}/api/live/${cohortId}/${selectedCourse}/end`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Live class ended successfully ✅");
    } catch (err) {
      console.error("Live end failed:", err);
      toast.error(
        err.response?.data?.message || "Failed to end live class. Please try again."
      );
    } finally {
      setEndingLive(false);
    }
  };

  const sendStudentMessage = (type, videoId, text) => {
    if (!text.trim()) return;

    setChatMessages((prev) => {
      const updated = {
        ...prev,
        [type]: {
          ...(prev[type] || {}),
          [videoId]: [
            ...(prev[type]?.[videoId] || []),
            {
              senderId: studentId,
              senderName: studentName,
              text,
              createdAt: new Date().toISOString(),
            },
          ],
        },
      };

      // persist to localStorage
      localStorage.setItem("chatMessages", JSON.stringify(updated));
      return updated;
    });

    setNewMessages((prev) => ({
      ...prev,
      [videoId]: "",
    }));
  };
  // Chat card component for videos
  function VideoChatCard({
    video,
    chatMessages,
    updateChatMessages,
    handleDeleteVideo,
  }) {
    const [message, setMessage] = React.useState("");

    const videoChat =
      (chatMessages.video && chatMessages.video[video._id]) || [];

    const sendMessage = () => {
      if (!message.trim()) return;

      const newMsg = {
        sender: "Coach",
        text: message,
        createdAt: new Date().toISOString(),
      };

      const updatedChat = [...videoChat, newMsg];

      updateChatMessages("video", video._id, updatedChat);
      setMessage("");
    };

    return (
      <Paper sx={{ p: 2, mt: 2, borderRadius: 2, position: "relative" }}>
        <IconButton
          sx={{ position: "absolute", top: 8, right: 8 }}
          color="error"
          onClick={() => handleDeleteVideo(video._id)}
        >
          <DeleteIcon />
        </IconButton>

        <Typography variant="subtitle1" fontWeight="bold">
          {video.title}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {video.course?.name || "Unknown Course"} • {video.cohortName || "No Cohort"}
        </Typography>

        <video
          src={video.fileUrl}
          controls
          style={{ width: "100%", borderRadius: 8, marginTop: 10 }}
        />
      </Paper>
    );
  }

  const [chatOpen, setChatOpen] = useState(() => {
    return sessionStorage.getItem(CHAT_STORAGE_KEY) === "true";
  });

  useEffect(() => {
    sessionStorage.setItem(CHAT_STORAGE_KEY, chatOpen ? "true" : "false");
  }, [chatOpen]);

  const [chatMessages, setChatMessages] = useState(() => {
    return safeParseJSON(localStorage.getItem("classChats"), {
      video: {},
      doc: {},
    });
  });
  const [newMessages, setNewMessages] = useState({});
  const socketRef = useRef(null);

  const coachName = "Coach";

  // console.log("COHORT ID FROM URL:", cohortId);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("token");

  const isMobile = useMediaQuery("(max-width:900px)");

  const barColors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#6366f1"];

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, key: "dashboard" },
    {
      text: "Chat",
      icon: (
        <Badge color="error" badgeContent={chatUnreadCount}>
          <ChatIcon />
        </Badge>
      ),
      key: "chat",
    },
    { text: "Upload Cohort Video", icon: <UploadFile />, key: "upload-video" },
    { text: "Upload Cohort Document", icon: <UploadFile />, key: "upload-doc" },
    // { text: "All Videos", icon: <UploadFile />, key: "videos" },
    {
      text: "Upload Self Learning Doc",
      icon: <UploadFile />,
      key: "upload-sl-doc",
    },
    {
      text: "Upload Free Learning Doc",
      icon: <UploadFile />,
      key: "upload-free-learning-doc",
    },

    { text: "Assignments", icon: <AssignmentTurnedIn />, key: "assignments" },
    { text: "Students", icon: <School />, key: "students" },
    {
      text: "Start / End Course",
      icon: <AssignmentTurnedIn />,
      key: "course-control",
    },
    { text: "Live Mode", icon: <LiveTv />, key: "live" },
    { text: "More", icon: <UploadFile />, key: "more" },
  ];

  useEffect(() => {
    if (!cohortId || !courseId) return;

    const token = localStorage.getItem("token");

    // create socket
    socketRef.current = io(BASE_URL, {
      auth: { token },
      transports: ["polling"],
    });

    // join room (emit ONLY)
    socketRef.current.emit("joinCohort", {
      room: `${cohortId}:${courseId}`,
    });

    // cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [cohortId, courseId]);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const markGroupChannelSeenOnServer = async (channel) => {
    if (!BASE_URL || !token || !channel) return;
    try {
      await axios.post(
        `${BASE_URL}/api/group-chat/${channel}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      // Fall back to local storage only on older backends.
    }
  };

  useEffect(() => {
    const currentUser = safeParseJSON(localStorage.getItem("user"), {});
    const currentUserId = currentUser?.id || currentUser?._id;
    let cancelled = false;

    const pollUnread = async () => {
      try {
        const { data } = await axios.get(
          `${BASE_URL}/api/group-chat/unread-summary`,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }
        );
        if (cancelled) return;
        const nextByChannel = {
          students: Number(data?.unreadByChannel?.students || 0),
          coaches: Number(data?.unreadByChannel?.coaches || 0),
        };
        const total = Number(
          data?.total ?? nextByChannel.students + nextByChannel.coaches
        );
        setChatUnreadByChannel(nextByChannel);
        setChatUnreadCount(total);
        return;
      } catch {
        // Keep the last unread state instead of hammering fallback endpoints.
      }
    };

    pollUnread();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        pollUnread();
      }
    };
    const interval = setInterval(pollUnread, 60000);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [BASE_URL, token]);

  useEffect(() => {
    if (!BASE_URL || !token) return;

    const currentUser = safeParseJSON(localStorage.getItem("user"), {});
    const currentUserId = currentUser?.id || currentUser?._id;
    const socket = io(BASE_URL, {
      auth: { token },
      transports: ["polling"],
    });

    socket.emit("joinGroupChat", { channel: "coaches" });
    socket.emit("joinGroupChat", { channel: "students" });

    const handleGroupMessage = ({ message, channel }) => {
      const senderId = message?.senderId?._id || message?.senderId;
      if (String(senderId) === String(currentUserId)) return;
      const incomingChannel =
        channel === "users" ? "students" : channel || message?.channel;
      if (incomingChannel !== "students" && incomingChannel !== "coaches") return;

      const isActiveRoom =
        activeTabRef.current === "chat" && openGroupChatChannel === incomingChannel;

      if (isActiveRoom) {
        localStorage.setItem(
          `group_chat_last_seen_coach_${incomingChannel}`,
          new Date().toISOString()
        );
        markGroupChannelSeenOnServer(incomingChannel);
        setChatUnreadByChannel((prev) => {
          const next = { ...prev, [incomingChannel]: 0 };
          setChatUnreadCount((next.students || 0) + (next.coaches || 0));
          return next;
        });
        return;
      }

      setChatUnreadByChannel((prev) => {
        const next = {
          ...prev,
          [incomingChannel]: (prev[incomingChannel] || 0) + 1,
        };
        if (activeTabRef.current !== "chat") {
          setChatUnreadCount((next.students || 0) + (next.coaches || 0));
        } else {
          setChatUnreadCount((count) => count + 1);
        }
        return next;
      });
    };

    socket.on("groupChatMessage", handleGroupMessage);

    return () => {
      socket.off("groupChatMessage", handleGroupMessage);
      socket.disconnect();
    };
  }, [BASE_URL, token]);

  const markGroupChannelSeen = (seenChannel) => {
    if (!seenChannel) return;
    const key = `group_chat_last_seen_coach_${seenChannel}`;
    localStorage.setItem(key, new Date().toISOString());
    markGroupChannelSeenOnServer(seenChannel);
    setChatUnreadByChannel((prev) => {
      const next = { ...prev, [seenChannel]: 0 };
      setChatUnreadCount((next.students || 0) + (next.coaches || 0));
      return next;
    });
  };
  // Listen for incoming messages
  useEffect(() => {
    if (!socketRef.current) return;

    const handleIncoming = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
    socketRef.current.on("cohortMessage", (msg) => {
      if (!document.hasFocus()) {
        setUnreadCount((c) => c + 1);
      }
    });

    socketRef.current.on("cohortMessage", handleIncoming);

    return () => {
      socketRef.current.off("cohortMessage", handleIncoming);
    };
  }, []);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        try {
          setChatMessages(
            safeParseJSON(e.newValue, {
              video: {},
              doc: {},
            })
          );
        } catch (err) {
          console.warn("Failed to parse classChats from storage event", err);
        }
      }
    };

    const handleCustom = () => {
      try {
        setChatMessages(
          safeParseJSON(localStorage.getItem(STORAGE_KEY), {
            video: {},
            doc: {},
          })
        );
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

  // Listen for incoming messages
  useEffect(() => {
    if (!socketRef.current) return;

    const socket = socketRef.current;

    const handleIncoming = (msg) => {
      setMessages((prev) => [...prev, msg]);

      if (!chatOpen) {
        setUnreadCount((c) => c + 1);
      }
    };

    socket.on("cohortMessage", handleIncoming);

    return () => {
      socket.off("cohortMessage", handleIncoming);
    };
  }, [chatOpen]);

  // Open chat sidebar
  const openChat = () => {
    setChatOpen(true);
    setUnreadCount(0);
  };

  const closeChat = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setChatOpen(false);
  };

  // helper to update parent chatMessages state

  const handleDocumentUpload = async (e) => {
    e.preventDefault();

    if (!docFile || !docTitle || !unlockAt) {
      toast.warning("All fields are required, including the unlock time.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      // 🔥 User selects Nigeria time (WAT)
      const localDate = new Date(unlockAt);

      // 🔥 Convert WAT (UTC+1) → UTC
      const adjustedDate = new Date(localDate.getTime() - 60 * 60 * 1000);
      const utcUnlockTime = adjustedDate.toISOString();

      // Prepare FormData
      const formData = new FormData();
      formData.append("title", docTitle);
      formData.append("courseId", selectedCourseId);
      formData.append("unlockAt", utcUnlockTime);
      formData.append("file", docFile);

      const res = await fetch(`${BASE_URL}/api/coach/upload-document`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      toast.success(
        `✅ Document uploaded! It will unlock at ${localDate.toLocaleTimeString(
          "en-NG",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        )} (Nigeria Time)`
      );

      // Clear form
      setDocTitle("");
      setDocFile(null);
      setUnlockAt("");

      // Optional refresh
      // if (typeof fetchDocuments === "function") fetchDocuments();
    } catch (err) {
      console.error("❌ Document Upload Error:", err);
      toast.error(err.message || "Document upload failed");
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
  // ✅ AUTO-SELECT FIRST COURSE WHEN VIDEOS LOAD
  useEffect(() => {
    if (!selectedCourseId && myVideos?.length) {
      const firstVideo = myVideos[0];

      // SAFETY: some APIs nest courseId
      const courseId =
        typeof firstVideo.courseId === "object"
          ? firstVideo.courseId._id
          : firstVideo.courseId || firstVideo.course?._id;

      if (courseId) {
        setSelectedCourseId(courseId);
      }
    }
  }, [myVideos, selectedCourseId]);

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
  const updateAssignmentDueDate = async () => {
    if (!selectedAssignment?.assignmentId || !editDueDate) return;

    try {
      setUpdatingDueDate(true);

      await axios.patch(
        `${BASE_URL}/api/assignment/${selectedAssignment.assignmentId}`,
        { dueDate: toAssignmentExpiry(editDueDate) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      loadAssignments();
      setMessage("Assignment reopened successfully");
      handleCloseAssignmentModal();
    } catch (err) {
      console.error(err);
      setMessage("Failed to update assignment");
    } finally {
      setUpdatingDueDate(false);
    }
  };

  // const updateAssignmentDueDate = async () => {
  //   if (!selectedAssignment?.assignmentId || !editDueDate) return;

  //   try {
  //     setUpdatingDueDate(true);

  //     await axios.patch(
  //       `${BASE_URL}/api/assignment/${selectedAssignment.assignmentId}`,
  //       { dueDate: editDueDate },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     setMessage("Due date updated successfully");
  //     setOpenAssignmentModal(false);
  //     setEditDueDate("");
  //     loadAssignments();
  //   } catch (err) {
  //     console.error("Failed to update due date", err);
  //     setMessage("Failed to update due date");
  //   } finally {
  //     setUpdatingDueDate(false);
  //   }
  // };

  // submit grade
  const submitGrade = async (studentId) => {
    if (!gradeInput || !selectedAssignment || !studentId) {
      toast.error("❌ Missing grade or student ID");
      return;
    }

    const studentIdStr =
      typeof studentId === "string" ? studentId : studentId?._id;

    if (!studentIdStr) {
      toast.error("❌ Invalid student ID");
      return;
    }

    try {
      setGradingLoading(true);

      const gradeValue = Number(gradeInput);
      if (Number.isNaN(gradeValue)) {
        toast.error("❌ Grade must be a number");
        return;
      }

      const assignmentId =
        selectedAssignment.assignmentId || selectedAssignment._id;

      await axios.put(
        `${BASE_URL}/api/assignment/grade/${assignmentId}/${studentIdStr}`,
        { grade: gradeValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("✅ Grade submitted successfully");

      // Update local state so DataGrid shows new grade immediately
      setSelectedAssignment((prev) => ({
        ...prev,
        submission: { ...prev.submission, grade: gradeValue },
        isGraded: true,
      }));

      handleCloseAssignmentModal();
    } catch (err) {
      console.error("Failed to submit grade:", err?.response?.data || err);
      toast.error("❌ Failed to submit grade — check console");
    } finally {
      setGradingLoading(false);
    }
  };
  const isExpired =
    selectedAssignment?.dueDate &&
    new Date(selectedAssignment.dueDate) < new Date();

  const handleGradeAssignment = () => {
    if (!selectedAssignment || !selectedAssignment.submission) {
      toast.error("❌ No submission selected");
      return;
    }

    const studentId = selectedAssignment.submission.studentId?._id;
    submitGrade(studentId);
  };
  // Fetch assigned courses from API
  const fetchAssignedCourses = async () => {
    try {
      setLoadingAssigned(true);
      const res = await axios.get(`${BASE_URL}/api/cohort/coach/assigned`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Assigned courses from API:", res.data);
      setAssignedCourses(normalizeAssignedCohorts(res.data?.cohorts));
    } catch (err) {
      console.error("Error fetching assigned courses:", err);
    } finally {
      setLoadingAssigned(false);
    }
  };

  // =========================
  // FLATTEN COURSES FOR DROPDOWN
  // =========================
  const flattenedAssignedCourses = React.useMemo(
    () =>
      safeAssignedCourses.flatMap((cohort) =>
        cohort.courses.map((course) => ({
          cohortCourseId: course.cohortCourseId,
          courseId: course.courseId,
          courseName: course.name,
          cohortName: cohort.cohortName,
          status: course.status,
        }))
      ),
    [safeAssignedCourses]
  );

  useEffect(() => {
    setCoursesArray(flattenedAssignedCourses);
  }, [flattenedAssignedCourses]);
  // auto-select first course when coursesArray changes
  useEffect(() => {
    if (coursesArray.length > 0 && !selectedCourse) {
      setSelectedCourse(coursesArray[0].cohortCourseId);
    }
  }, [coursesArray]);
  // Start course
  // const handleStartCourse = async () => {
  //   if (!selectedCourse) {
  //     alert("Please select a course to start");
  //     return;
  //   }

  //   try {
  //     setActionLoading(true);

  //     const { data } = await axios.put(
  //       `${BASE_URL}/api/cohort/start/course/${selectedCourse}`,
  //       {},
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     fetchAssignedCourses(); // refresh courses
  //     alert(data.message || "Course started successfully");
  //   } catch (err) {
  //     console.error(err);
  //     alert(err.response?.data?.message || "Failed to start course");
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };

  const handleStartCourse = async () => {
    if (!selectedCourse) {
      alert("Please select a course to start");
      return;
    }

    // ✅ confirmation added
    const confirmed = window.confirm(
      "Are you sure you want to start this cohort?"
    );

    if (!confirmed) return;

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

    // ✅ confirmation added
    const confirmed = window.confirm(
      "Are you sure you want to end this cohort?"
    );

    if (!confirmed) return;

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

  // const handleEndCourse = async () => {
  //   if (!selectedCourse) {
  //     alert("Please select a course to end");
  //     return;
  //   }

  //   try {
  //     setActionLoading(true);

  //     const { data } = await axios.put(
  //       `${BASE_URL}/api/cohort/end/course/${selectedCourse}`,
  //       {},
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     fetchAssignedCourses(); // refresh courses
  //     alert(data.message || "Course ended successfully");
  //   } catch (err) {
  //     console.error(err);
  //     alert(err.response?.data?.message || "Failed to end course");
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };

  useEffect(() => {
    if (!safeAssignedCourses.length) {
      setCoursesArray([]);
      return;
    }

    const flatCourses = safeAssignedCourses.flatMap((cohort) =>
      cohort.courses.map((course) => ({
        cohortCourseId: course.cohortCourseId,
        courseId: course.courseId,
        courseName: course.name,
        cohortName: cohort.cohortName,
        status: course.status,
      }))
    );

    setCoursesArray(flatCourses);
  }, [safeAssignedCourses]);

  useEffect(() => {
    if (activeTab === "course-control") {
      fetchAssignedCourses();
    }
  }, [activeTab]);

  useEffect(() => {
    if (!uploadCohorts.length) {
      setCohorts([]);
      setCohortId("");
      setSelectedCohortId("");
      setSelectedCourseId("");
      setSelectedCourse("");
      return;
    }

    const cohortStillValid = uploadCohorts.some(
      (cohort) => cohort.cohortId === selectedCohortId
    );
    const nextCohortId = cohortStillValid
      ? selectedCohortId
      : uploadCohorts[0].cohortId;

    if (nextCohortId !== selectedCohortId) {
      setSelectedCohortId(nextCohortId);
    }

    const nextCourses =
      uploadCohorts.find((cohort) => cohort.cohortId === nextCohortId)?.courses || [];
    const courseStillValid = nextCourses.some(
      (course) => course.courseId === selectedCourseId
    );

    if (!courseStillValid) {
      setSelectedCourseId(nextCourses[0]?.courseId || "");
    }
  }, [uploadCohorts, selectedCohortId, selectedCourseId]);

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
    setCohorts(uploadCohorts);
    if (!uploadCohorts.length) return;

    const cohortStillValid = uploadCohorts.some(
      (cohort) => cohort.cohortId === cohortId
    );

    if (!cohortStillValid) {
      setCohortId(uploadCohorts[0].cohortId);
    }
  }, [uploadCohorts, cohortId, selectedCourseId]);

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

    if (!videoTitle || !videoFile || !classStartTime || !selectedCourseId) {
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
    if (selectedCohortId) {
      formData.append("cohortId", selectedCohortId);
    }

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
      setSelectedCourseId(
        uploadCoursesForSelectedCohort[0]?.courseId || selectedCourseId
      );
      setSelectedCohortId(uploadCohorts[0]?.cohortId || "");
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
    localStorage.removeItem("selectedCohortId");
    localStorage.removeItem("userCohorts");
    localStorage.removeItem("classChats");
    localStorage.removeItem("userName");
    localStorage.removeItem("userPhoto");
    sessionStorage.removeItem(CHAT_STORAGE_KEY);
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
      setAssignmentSummaries(
        Array.isArray(res.data.assignments) ? res.data.assignments : []
      );
      setFlattenedSubmissions(res.data.submissions || []); // FIX
    } catch (err) {
      console.error("Error fetching assignments:", err?.response?.data || err);
      setMessage("Failed to load assignments");
      setAssignments({});
      setAssignmentSummaries([]);
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
      setCreatingAssignment(true);

      await axios.post(
        `${BASE_URL}/api/assignment`,
        {
          cohortId: selectedCohortId,
          title: newTitle,
          description: newDescription,
          dueDate: toAssignmentExpiry(newDueDate),
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
    } finally {
      setCreatingAssignment(false);
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
        const ratingItems = normalizeRatings(res.data);
        const monthlyRatings = ratingItems.reduce((acc, item) => {
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
    .filter((assignment) => assignment && typeof assignment === "object")
    .flatMap((a) => {
      const submissions = Array.isArray(a.submissions) ? a.submissions : [];
      const cohortStudentEntries = Array.isArray(a?.cohortId?.studentIds)
        ? a.cohortId.studentIds
        : [];
      const eligibleStudentIds = new Set(
        cohortStudentEntries
          .filter((entry) =>
            Array.isArray(entry?.enrollments) &&
            entry.enrollments.some(
              (enrollment) =>
                String(getEntityId(enrollment?.courseId)) ===
                  String(getEntityId(a?.courseId)) && enrollment?.hasAccess
            )
          )
          .map((entry) => String(getEntityId(entry?.studentId)))
          .filter(Boolean)
      );
      const submittedRows = submissions.map((s, idx) => ({
          id: `${a._id}-${s.studentId?._id || idx}`,
          assignmentId: a._id,
          title: a.title,
          description: a.description,
          cohortId: getEntityId(a.cohortId),
          cohortName: a.cohortId?.name || "No Cohort",
          studentId: s.studentId?._id,
          studentName: s.studentId?.fullName || "Unknown",
          grade: s.grade ?? "Not Graded",
          isGraded: s.grade != null,
          hasSubmission: true,
          status: s.grade != null ? "Completed" : "Submitted",
          dueDate: a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "N/A",
          submission: s,
          createdAt: a.createdAt || a.updatedAt || a.dueDate || null,
      }));

      const submittedStudentIds = new Set(
        submissions
          .map((s) => String(s.studentId?._id || s.studentId || ""))
          .filter(Boolean)
      );

      const noSubmissionRows = (Array.isArray(students) ? students : [])
        .filter((student) => {
          const studentId = String(student?.studentId || student?._id || "");
          return (
            studentId &&
            eligibleStudentIds.has(studentId) &&
            !submittedStudentIds.has(studentId)
          );
        })
        .map((student) => {
          const studentId = student?.studentId || student?._id;
          return {
            id: `${a._id}-${studentId}-no-sub`,
            assignmentId: a._id,
            title: a.title,
            description: a.description,
            cohortId: getEntityId(a.cohortId),
            cohortName: a.cohortId?.name || "No Cohort",
            studentId,
            studentName: student?.fullName || "Unknown Student",
            grade: "No submission",
            isGraded: false,
            hasSubmission: false,
            status: new Date(a.dueDate) < new Date() ? "Expired" : "Not submitted",
            dueDate: a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "N/A",
            submission: null,
            createdAt: a.createdAt || a.updatedAt || a.dueDate || null,
          };
        });

      if (submittedRows.length > 0 || noSubmissionRows.length > 0) {
        return [...submittedRows, ...noSubmissionRows];
      }

      return [
        {
          id: `${a._id}-no-sub`,
          assignmentId: a._id,
          title: a.title,
          description: a.description,
          cohortId: getEntityId(a.cohortId),
          cohortName: a.cohortId?.name || "No Cohort",
          studentId: null,
          studentName: "-",
          grade: "No submission",
          isGraded: false,
          hasSubmission: false,
          status: new Date(a.dueDate) < new Date() ? "Expired" : "Pending",
          dueDate: a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "N/A",
          submission: null,
          createdAt: a.createdAt || a.updatedAt || a.dueDate || null,
        },
      ];
    })
    .sort((left, right) => {
      const leftDate = new Date(left.createdAt || 0).getTime();
      const rightDate = new Date(right.createdAt || 0).getTime();
      return rightDate - leftDate;
    });

  const filteredAssignmentRows = selectedCohortId
    ? assignmentRows.filter((r) => r.cohortId === selectedCohortId)
    : assignmentRows;

  const filteredAssignmentSummaries = selectedCohortId
    ? assignmentSummaries.filter(
        (assignment) => String(assignment?.cohortId || "") === selectedCohortId
      )
    : assignmentSummaries;

  useEffect(() => {
    setAssignmentPage(1);
  }, [selectedCohortId, assignmentRows.length]);

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
                secondary={item.secondary || ""}
                primaryTypographyProps={{ color: "#fff" }}
                secondaryTypographyProps={{
                  color: "rgba(255,255,255,0.85)",
                  sx: { fontSize: 11, fontWeight: 600, mt: 0.25 },
                }}
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
          minWidth: 0,
          minHeight: "100vh",
          overflow: "visible",
        }}
      >
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            overflowY: "auto",
            overflowX: "hidden",
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

              {/* Upload Instructions */}
              <Typography sx={{ mb: 2, color: "text.secondary" }}>
                ⚠️ Upload Guidelines:
                <br />• Videos must not exceed <b>20MB</b>
                <br />• Documents must not exceed <b>8MB</b>
              </Typography>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!videoTitle) return alert("Video title is required!");
                  if (!videoFile) return alert("Please select a video file!");
                  if (!classStartTime)
                    return alert("Class start time is required!");
                  if (!selectedCohortId)
                    return alert("Please select a cohort!");
                  if (!selectedCourseId)
                    return alert("Please select a course!");

                  const utcTime = new Date(classStartTime).toISOString();

                  const formData = new FormData();
                  formData.append("title", videoTitle);
                  formData.append("file", videoFile);
                  formData.append("classStartTime", utcTime);
                  formData.append("courseId", selectedCourseId);
                  if (selectedCohortId) {
                    formData.append("cohortId", selectedCohortId);
                  }

                  try {
                    setLoading(true);
                    setVideoUploadFeedback(null);
                    const { data } = await axios.post(
                      `${BASE_URL}/api/coach/upload-video`,
                      formData,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setMessage(data.message);
                    setVideoUploadFeedback({
                      severity: "success",
                      title: "Video uploaded successfully",
                      detail:
                        data.message ||
                        "The video is now saved and scheduled for the selected class time.",
                    });
                    setVideoTitle("");
                    setVideoFile(null);
                    setClassStartTime("");
                    setSelectedCourseId(
                      uploadCoursesForSelectedCohort[0]?.courseId || ""
                    );
                    setSelectedCohortId(uploadCohorts[0]?.cohortId || "");
                    loadVideos();
                    await fetchMyVideos();
                  } catch (err) {
                    console.error(err);
                    const errMsg =
                      err.response?.data?.message ||
                      err.message ||
                      "Upload failed";
                    setMessage(`❌ ${errMsg}`);
                    setVideoUploadFeedback(buildVideoUploadFeedback(err));
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
                  disabled={!selectedCohortId || uploadCoursesForSelectedCohort.length === 0}
                >
                  {uploadCoursesForSelectedCohort.length === 0 ? (
                    <MenuItem disabled>No courses available</MenuItem>
                  ) : (
                    uploadCoursesForSelectedCohort.map((course) => (
                      <MenuItem key={course.courseId} value={course.courseId}>
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
                  {uploadCohorts.length === 0 ? (
                    <MenuItem value="">No cohort assigned</MenuItem>
                  ) : (
                    uploadCohorts.map((cohort) => (
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
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;

                        const maxVideoSize = 20 * 1024 * 1024; // 20MB
                        if (file.size > maxVideoSize) {
                          alert("❌ Video must not be more than 20MB");
                          e.target.value = "";
                          return;
                        }

                        setVideoFile(file);
                      }}
                    />
                  </Button>

                  {videoFile && (
                    <Typography sx={{ mt: 1 }}>
                      Selected: {videoFile.name}
                    </Typography>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={
                      loading ||
                      !selectedCohortId ||
                      !selectedCourseId ||
                      !videoTitle ||
                      !videoFile ||
                      !classStartTime
                    }
                  >
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

              {videoUploadFeedback && (
                <Alert
                  severity={videoUploadFeedback.severity}
                  sx={{ mt: 2, mb: 2 }}
                >
                  <Typography fontWeight="bold">
                    {videoUploadFeedback.title}
                  </Typography>
                  <Typography variant="body2">
                    {videoUploadFeedback.detail}
                  </Typography>
                </Alert>
              )}

              <Typography variant="h6">🎬 My Uploaded Videos</Typography>

              {Array.isArray(myVideos) && myVideos.length > 0 ? (
                myVideos.map((video) => (
                  <LazyVideoWrapper key={video._id}>
                    <VideoChatCard
                      video={video}
                      chatMessages={chatMessages}
                      newMessages={newMessages}
                      setNewMessages={setNewMessages}
                      sendStudentMessage={sendStudentMessage}
                      handleDeleteVideo={handleDeleteVideo}
                      studentId={studentId}
                    />
                  </LazyVideoWrapper>
                ))
              ) : (
                <Typography sx={{ mt: 2 }}>No videos uploaded yet.</Typography>
              )}
            </Paper>
          )}
          {/* {activeTab === "upload-video" && (
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
                myVideos.map((video) => (
                  <VideoChatCard
                    key={video._id}
                    video={video}
                    chatMessages={chatMessages}
                    newMessages={newMessages}
                    setNewMessages={setNewMessages}
                    sendStudentMessage={sendStudentMessage}
                    handleDeleteVideo={handleDeleteVideo}
                    studentId={studentId}
                  />
                ))
              ) : (
                <Typography sx={{ mt: 2 }}>No videos uploaded yet.</Typography>
              )}
            </Paper>
          )} */}

          {/* Upload Document */}
          {activeTab === "upload-doc" && (
            <Paper sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                📄 Upload Document
              </Typography>

              {/* Upload Instruction */}
              <Typography sx={{ mb: 2, color: "text.secondary" }}>
                ⚠️ Upload Guidelines:
                <br />• Documents must not exceed <b>8MB</b>
                <br />• Only PDF, DOC, DOCX allowed
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

                      const maxDocSize = 8 * 1024 * 1024; // 8MB

                      const allowedTypes = [
                        "application/pdf",
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                      ];

                      if (!allowedTypes.includes(file.type)) {
                        toast.error(
                          "Only PDF, DOC, and DOCX files are allowed."
                        );
                        e.target.value = "";
                        return;
                      }

                      if (file.size > maxDocSize) {
                        toast.error("Document must not exceed 8MB.");
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
          {/* upload self learning documents, video */}
          {activeTab === "upload-sl-doc" && (
            <Paper sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                📚 Upload Self-Learning Content
              </Typography>

              {/* Upload Instruction */}
              <Typography sx={{ mb: 2, color: "text.secondary" }}>
                ⚠️ Upload Guidelines:
                <br />• Documents must not exceed <b>8MB</b> (PDF, DOC, DOCX)
                <br />• Videos must not exceed <b>20MB</b>
              </Typography>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();

                  if (
                    !contentType ||
                    !title ||
                    !selectedSelfLearningCourseId ||
                    (!file && !url)
                  ) {
                    toast.error("All required fields must be filled");
                    return;
                  }

                  const formData = new FormData();
                  formData.append("type", contentType);
                  formData.append("title", title);

                  if (file) formData.append("file", file);
                  if (url) formData.append("url", url);

                  try {
                    setLoading(true);

                    await axios.post(
                      `${BASE_URL}/api/self-learning/course/${selectedSelfLearningCourseId}/content`,
                      formData,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );

                    toast.success("Content uploaded successfully ✅");

                    setTitle("");
                    setFile(null);
                    setUrl("");

                    fetchMyCourseContent();
                  } catch (err) {
                    toast.error(err.response?.data?.message || "Upload failed");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {/* Content Type */}
                <TextField
                  select
                  label="Content Type"
                  fullWidth
                  sx={{ mb: 2 }}
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                >
                  <MenuItem value="document">Document</MenuItem>
                  <MenuItem value="video">Video</MenuItem>
                </TextField>

                {/* Title */}
                <TextField
                  label="Title"
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                {/* Self-Learning Course */}
                <TextField
                  select
                  label="Select Self-Learning Course"
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                  value={selectedSelfLearningCourseId}
                  onChange={(e) =>
                    setSelectedSelfLearningCourseId(e.target.value)
                  }
                >
                  {selfLearningCourses.map((course) => (
                    <MenuItem key={course._id} value={course._id}>
                      {course.title}
                    </MenuItem>
                  ))}
                </TextField>

                {/* File picker */}
                {(contentType === "document" || contentType === "video") && (
                  <>
                    <Button
                      variant="contained"
                      component="label"
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      Choose {contentType === "video" ? "Video" : "Document"}
                      <input
                        hidden
                        type="file"
                        accept={
                          contentType === "video"
                            ? "video/*"
                            : ".pdf,.doc,.docx"
                        }
                        onChange={(e) => {
                          const selected = e.target.files[0];
                          if (!selected) return;

                          // Document rules
                          if (contentType === "document") {
                            const maxDocSize = 8 * 1024 * 1024;
                            const allowedTypes = [
                              "application/pdf",
                              "application/msword",
                              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                            ];

                            if (!allowedTypes.includes(selected.type)) {
                              toast.error(
                                "Only PDF, DOC, and DOCX files are allowed."
                              );
                              e.target.value = "";
                              return;
                            }

                            if (selected.size > maxDocSize) {
                              toast.error("Document must not exceed 8MB.");
                              e.target.value = "";
                              return;
                            }
                          }

                          // Video rules
                          if (contentType === "video") {
                            const maxVideoSize = 20 * 1024 * 1024;

                            if (selected.size > maxVideoSize) {
                              toast.error("Video must not exceed 20MB.");
                              e.target.value = "";
                              return;
                            }
                          }

                          setFile(selected);
                        }}
                      />
                    </Button>

                    {file && (
                      <Typography variant="body2" color="text.secondary">
                        Selected file: <strong>{file.name}</strong>
                      </Typography>
                    )}
                  </>
                )}

                {/* Link input */}
                {contentType === "link" && (
                  <TextField
                    label="Content URL"
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Upload Content"}
                </Button>
              </form>

              <Typography variant="h6" sx={{ mt: 4 }}>
                📂 Uploaded Contents
              </Typography>

              {slLoading ? (
                <CircularProgress />
              ) : slError ? (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {slError}
                </Alert>
              ) : slContents.length === 0 ? (
                <Typography>No content uploaded yet.</Typography>
              ) : (
                slContents.map((item) => (
                  <Paper
                    key={item._id}
                    sx={{ p: 2, mb: 2, position: "relative" }}
                  >
                    <IconButton
                      sx={{ position: "absolute", top: 8, right: 8 }}
                      onClick={async () => {
                        if (!window.confirm("Delete this content?")) return;

                        await axios.delete(
                          `${BASE_URL}/api/self-learning/content/${item._id}`,
                          { headers: { Authorization: `Bearer ${token}` } }
                        );

                        fetchMyCourseContent();
                      }}
                    >
                      <Delete color="error" />
                    </IconButton>

                    <Typography fontWeight="bold">{item.title}</Typography>
                    <Typography variant="body2">Type: {item.type}</Typography>

                    <Button
                      href={item.url}
                      target="_blank"
                      variant="outlined"
                      sx={{ mt: 1 }}
                    >
                      Open
                    </Button>
                  </Paper>
                ))
              )}
            </Paper>
          )}

          {/* upload free course */}
          {activeTab === "upload-free-learning-doc" && (
            <Paper sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                🎁 Upload Free Learning Content
              </Typography>

              {/* Size Instructions */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                📌 Documents must not exceed <strong>8MB</strong>. Videos must
                not exceed <strong>20MB</strong>.
              </Typography>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();

                  if (
                    !freeContentType ||
                    !freeTitle ||
                    !selectedFreeCourseId ||
                    (!freeFile && !freeUrl)
                  ) {
                    toast.warning("All fields are required");
                    return;
                  }

                  const formData = new FormData();
                  formData.append("type", freeContentType);
                  formData.append("title", freeTitle);
                  if (freeFile) formData.append("file", freeFile);
                  if (freeUrl) formData.append("url", freeUrl);

                  try {
                    setLoadingFreeContent(true);

                    await axios.post(
                      `${BASE_URL}/api/free-learning/free-courses/${selectedFreeCourseId}/content`,
                      formData,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );

                    toast.success("Content uploaded successfully ✅");

                    setFreeTitle("");
                    setFreeFile(null);
                    setFreeUrl("");

                    fetchFreeCourseContents();
                  } catch (err) {
                    toast.error(err.response?.data?.message || "Upload failed");
                  } finally {
                    setLoadingFreeContent(false);
                  }
                }}
              >
                {/* Content Type */}
                <TextField
                  select
                  label="Content Type"
                  fullWidth
                  sx={{ mb: 2 }}
                  value={freeContentType}
                  onChange={(e) => {
                    setFreeContentType(e.target.value);
                    setFreeFile(null);
                  }}
                >
                  <MenuItem value="document">Document</MenuItem>
                  <MenuItem value="video">Video</MenuItem>
                </TextField>

                {/* Title */}
                <TextField
                  label="Title"
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                  value={freeTitle}
                  onChange={(e) => setFreeTitle(e.target.value)}
                />

                {/* Free Course Selector */}
                <TextField
                  select
                  label="Select Free Course"
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                  value={selectedFreeCourseId}
                  onChange={(e) => setSelectedFreeCourseId(e.target.value)}
                >
                  {freeCourses.map((course) => (
                    <MenuItem key={course._id} value={course._id}>
                      {course.title}
                    </MenuItem>
                  ))}
                </TextField>

                {/* File Upload */}
                {(freeContentType === "document" ||
                  freeContentType === "video") && (
                  <>
                    <Button
                      variant="contained"
                      component="label"
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      Choose{" "}
                      {freeContentType === "video" ? "Video" : "Document"}
                      <input
                        hidden
                        type="file"
                        accept={
                          freeContentType === "video"
                            ? "video/*"
                            : ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        }
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;

                          const sizeMB = file.size / (1024 * 1024);

                          if (freeContentType === "document") {
                            const allowedTypes = [
                              "application/pdf",
                              "application/msword",
                              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                            ];

                            if (!allowedTypes.includes(file.type)) {
                              toast.error("Only PDF, DOC, DOCX allowed");
                              e.target.value = "";
                              return;
                            }

                            if (sizeMB > 8) {
                              toast.error("Document must not exceed 8MB");
                              e.target.value = "";
                              return;
                            }
                          }

                          if (freeContentType === "video") {
                            if (sizeMB > 20) {
                              toast.error("Video must not exceed 20MB");
                              e.target.value = "";
                              return;
                            }
                          }

                          setFreeFile(file);
                        }}
                      />
                    </Button>

                    {freeFile && (
                      <Typography variant="body2">
                        Selected: <strong>{freeFile.name}</strong>
                      </Typography>
                    )}
                  </>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loadingFreeContent}
                >
                  {loadingFreeContent ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Upload Content"
                  )}
                </Button>
              </form>

              {/* Uploaded Contents */}
              <Typography variant="h6" sx={{ mt: 4 }}>
                📂 Uploaded Contents
              </Typography>

              {loadingFreeContent ? (
                <CircularProgress />
              ) : freeContents.length === 0 ? (
                <Typography>No content uploaded yet.</Typography>
              ) : (
                freeContents.map((item) => (
                  <Paper
                    key={item._id}
                    sx={{ p: 2, mb: 2, position: "relative" }}
                  >
                    <IconButton
                      sx={{ position: "absolute", top: 8, right: 8 }}
                      onClick={async () => {
                        if (!window.confirm("Delete this content?")) return;

                        await axios.delete(
                          `${BASE_URL}/api/free-learning/free-content/${item._id}`,
                          { headers: { Authorization: `Bearer ${token}` } }
                        );

                        toast.success("Content deleted");
                        fetchFreeCourseContents();
                      }}
                    >
                      <Delete color="error" />
                    </IconButton>

                    <Typography fontWeight="bold">{item.title}</Typography>
                    <Typography variant="body2">Type: {item.type}</Typography>

                    <Button
                      href={item.url}
                      target="_blank"
                      variant="outlined"
                      sx={{ mt: 1 }}
                    >
                      Open
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
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    lg: "repeat(4, minmax(0, 1fr))",
                  },
                  gap: 2,
                  mb: 3,
                  alignItems: "stretch",
                  p: 2,
                  border: "1px solid #e5e7eb",
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
                  "> .MuiTextField-root": { width: "100%" },
                }}
              >
                <TextField
                  select
                  label="Select Cohort"
                  value={selectedCohortId}
                  onChange={(e) => setSelectedCohortId(e.target.value)}
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
                  multiline
                  minRows={4}
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
                  fullWidth
                  sx={{
                    minHeight: 56,
                    alignSelf: "center",
                    gridColumn: { xs: "1", sm: "1 / -1", lg: "1 / -1" },
                  }}
                  disabled={
                    creatingAssignment ||
                    !newTitle ||
                    !newDueDate ||
                    !selectedCohortId
                  }
                >
                  {creatingAssignment ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    "Create Assignment"
                  )}
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
              ) : filteredAssignmentSummaries.length === 0 &&
                filteredAssignmentRows.length === 0 ? (
                <Typography>No assignments available yet.</Typography>
              ) : (
                <>
                  <Stack spacing={1.5} sx={{ mb: 3 }}>
                    {filteredAssignmentSummaries.map((assignment) => (
                      <Paper
                        key={assignment.assignmentId}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: "#f8fafc",
                        }}
                      >
                        <Typography fontWeight="bold">
                          {assignment.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {assignment.cohortName} • {assignment.courseName} • Due:{" "}
                          {assignment.dueDate
                            ? new Date(assignment.dueDate).toLocaleDateString()
                            : "N/A"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Eligible Students: {assignment.eligibleStudentsCount} •
                          Submitted: {assignment.submissionCount} • Pending Review:{" "}
                          {assignment.pendingReviewCount}
                        </Typography>
                        {assignment.description ? (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {assignment.description}
                          </Typography>
                        ) : null}
                      </Paper>
                    ))}
                  </Stack>

                  <Stack spacing={1.5} sx={{ mb: 2 }}>
                    {filteredAssignmentRows
                      .slice(
                        (assignmentPage - 1) * ASSIGNMENTS_PER_PAGE,
                        assignmentPage * ASSIGNMENTS_PER_PAGE
                      )
                      .map((row) => (
                      <Paper
                        key={row.id}
                        variant="outlined"
                        sx={{
                          p: 2,
                          display: "flex",
                          gap: 2,
                          alignItems: { xs: "stretch", sm: "center" },
                          justifyContent: "space-between",
                          flexDirection: { xs: "column", sm: "row" },
                          borderRadius: 2,
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight="bold">{row.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {row.studentName} • {row.cohortName} • {row.status}
                            {" "}• Grade: {row.grade}
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={!row.hasSubmission || row.isGraded}
                          sx={{
                            bgcolor:
                              !row.hasSubmission || row.isGraded
                                ? "#94a3b8"
                                : "#10b981",
                            flexShrink: 0,
                          }}
                          onClick={() =>
                            handleOpenAssignmentModal(row, row.submission)
                          }
                        >
                          {!row.hasSubmission
                            ? "No Submission"
                            : row.isGraded
                            ? "Graded"
                            : "View & Grade"}
                        </Button>
                      </Paper>
                    ))}
                  </Stack>
                  {Math.ceil(filteredAssignmentRows.length / ASSIGNMENTS_PER_PAGE) >
                    1 && (
                    <Stack alignItems="center" sx={{ mb: 3 }}>
                      <Pagination
                        count={Math.ceil(
                          filteredAssignmentRows.length / ASSIGNMENTS_PER_PAGE
                        )}
                        page={assignmentPage}
                        color="success"
                        onChange={(_, page) => setAssignmentPage(page)}
                      />
                    </Stack>
                  )}
                {false && (
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
                      {
                        field: "actions",
                        headerName: "Action",
                        width: 190,
                        renderCell: (params) => (
                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              bgcolor: params.row.isGraded
                                ? "#94a3b8"
                                : "#10b981",
                              whiteSpace: "nowrap",
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
                    ]}
                    pageSize={5}
                  />
                </div>
                )}
                </>
              )}

              {/* Assignments Grouped by Cohort */}
              {false && (studentAssignmentsLoading || assignmentsLoading ? (
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
                        rows={filteredAssignments.flatMap((a, index) =>
                          Array.isArray(a.submissions) &&
                          a.submissions.length > 0
                            ? a.submissions.map((s, i) => ({
                                id: s?._id || `${a._id}-${i}`,
                                assignment: a,
                                studentName:
                                  s?.studentId?.fullName || "Unknown Student",
                                title: a.title,
                                description: a.description,
                                dueDate: a.dueDate
                                  ? new Date(a.dueDate).toLocaleDateString()
                                  : "N/A",
                                grade:
                                  s?.grade !== null && s?.grade !== undefined
                                    ? s.grade
                                    : "Not Graded",
                                status:
                                  s?.grade != null
                                    ? "Completed"
                                    : new Date(a.dueDate) < new Date()
                                    ? "Expired"
                                    : "Submitted",
                                hasSubmission: true,
                                isGraded: s?.grade != null,
                                submission: s,
                              }))
                            : [
                                {
                                  id: `${a._id}-no-submission`,
                                  assignment: a,
                                  studentName: "-",
                                  title: a.title,
                                  description: a.description,
                                  dueDate: a.dueDate
                                    ? new Date(a.dueDate).toLocaleDateString()
                                    : "N/A",
                                  grade: "No Submission",
                                  status:
                                    new Date(a.dueDate) < new Date()
                                      ? "Expired"
                                      : "Pending",
                                  hasSubmission: false,
                                  isGraded: false,
                                  submission: null,
                                },
                              ]
                        )}
                        columns={[
                          {
                            field: "actions",
                            headerName: "Action",
                            width: 190,
                            renderCell: (params) => {
                              const isExpired =
                                params.row.assignment?.dueDate &&
                                new Date(params.row.assignment.dueDate) <
                                  new Date();

                              return (
                                <Button
                                  variant="contained"
                                  size="small"
                                  disabled={
                                    !params.row.hasSubmission ||
                                    params.row.isGraded ||
                                    isExpired
                                  }
                                  sx={{
                                    bgcolor:
                                      !params.row.hasSubmission ||
                                      params.row.isGraded ||
                                      isExpired
                                        ? "#94a3b8"
                                        : "#10b981",
                                    whiteSpace: "nowrap",
                                  }}
                                  onClick={() =>
                                    handleOpenAssignmentModal(
                                      params.row.assignment,
                                      params.row.submission
                                    )
                                  }
                                >
                                  {!params.row.hasSubmission
                                    ? "No Submission"
                                    : isExpired
                                    ? "Expired"
                                    : params.row.isGraded
                                    ? "Graded"
                                    : "View & Grade"}
                                </Button>
                              );
                            },
                          },
                          {
                            field: "studentName",
                            headerName: "Student",
                            width: 200,
                          },
                          {
                            field: "title",
                            headerName: "Assignment",
                            width: 220,
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
                          { field: "status", headerName: "Status", width: 140 },
                        ]}
                        pageSize={5}
                      />
                    </div>
                  );
                })()
              ))}
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

                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                      {selectedAssignment.title}
                    </Typography>

                    {selectedAssignment.submission?.file ? (
                      <Typography sx={{ mb: 2 }}>
                        <a
                          href={selectedAssignment.submission.file}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Submitted Document
                        </a>
                      </Typography>
                    ) : (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        No submission available
                      </Alert>
                    )}

                    {selectedAssignment.submission?.grade != null ? (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        Grade: <b>{selectedAssignment.submission.grade}%</b>
                      </Alert>
                    ) : (
                      <TextField
                        label="Grade"
                        type="number"
                        fullWidth
                        value={gradeInput}
                        onChange={(e) => setGradeInput(e.target.value)}
                        sx={{ mb: 2 }}
                      />
                    )}

                    <Button
                      variant="contained"
                      color="success"
                      disabled={!gradeInput || gradingLoading || isExpired}
                      onClick={handleGradeAssignment}
                      sx={{ mb: 3 }}
                    >
                      {gradingLoading ? "Submitting..." : "Submit Grade"}
                    </Button>

                    <Divider sx={{ mb: 2 }} />

                    <TextField
                      type="date"
                      label="Edit Due Date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      sx={{ mb: 2 }}
                    />

                    <Button
                      variant="contained"
                      disabled={updatingDueDate || !editDueDate}
                      onClick={updateAssignmentDueDate}
                    >
                      {updatingDueDate ? "Updating..." : "Update Due Date"}
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
                      id: s?.studentId, // use studentId
                      fullName: s?.fullName,
                      email: s?.email,
                      phoneNumber: s?.phoneNumber || "-", // fallback if missing
                      progress:
                        s?.enrollments && s?.enrollments.length > 0
                          ? `${
                              s?.enrollments.filter((e) => e.hasAccess).length
                            }/${s?.enrollments.length} courses`
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
              <Typography variant="h4" fontWeight="bold" color="error">
                🔴 Live Class
              </Typography>

              {/* Cohort dropdown */}
              <FormControl fullWidth sx={{ mt: 3 }}>
                <InputLabel>Select Cohort</InputLabel>
                <Select
                  value={cohortId}
                  label="Select Cohort"
                  onChange={(e) => {
                    setCohortId(e.target.value);
                    setSelectedCourse(""); // Reset course when cohort changes
                  }}
                >
                  {cohorts.map((cohort) => (
                    <MenuItem key={cohort.cohortId} value={cohort.cohortId}>
                      {cohort.cohortName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Course dropdown */}
              <FormControl fullWidth sx={{ mt: 2 }} disabled={!cohortId}>
                <InputLabel>Select Course</InputLabel>
                <Select
                  value={selectedCourse}
                  label="Select Course"
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  {coursesArray.length === 0 ? (
                    <MenuItem disabled>No courses available</MenuItem>
                  ) : (
                    coursesArray.map((course) => (
                      <MenuItem
                        key={course.cohortCourseId}
                        value={course.cohortCourseId}
                      >
                        {course.courseName} ({course.cohortName})
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              {/* Meet link */}
              <TextField
                fullWidth
                label="Google Meet Link"
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                sx={{ mt: 3 }}
              />

              {/* Start button */}
              <Button
                variant="contained"
                color="success"
                sx={{ mt: 3 }}
                disabled={startingLive}
                onClick={startLiveVideo}
              >
                {startingLive ? "Starting..." : "Start Live Class"}
              </Button>
              <Button
                variant="contained"
                color="error"
                sx={{ mt: 2, ml: 2 }}
                disabled={endingLive}
                onClick={endLiveVideo}
              >
                {endingLive ? "Ending..." : "End Live Class"}
              </Button>
            </Paper>
          )}
          {activeTab === "chat" && (
            <GlobalChatPanel
              role="coach"
              token={token}
              baseUrl={BASE_URL}
              unreadSummary={chatUnreadByChannel}
              onActiveChannelChange={setOpenGroupChatChannel}
              onSeen={(seenChannel) => markGroupChannelSeen(seenChannel)}
            />
          )}
          {activeTab === "more" && (
            <Paper sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                More
              </Typography>
              <Typography sx={{ mb: 1 }}>
                Current Cohort: <strong>{cohortId || "Not selected"}</strong>
              </Typography>
              <Typography sx={{ mb: 2 }}>
                Update your profile or change password from your profile page.
              </Typography>
              <Button
                variant="contained"
                sx={{ mr: 1, mb: 1 }}
                onClick={() => {
                  window.location.href = "/profile";
                }}
              >
                Open Profile & Change Password
              </Button>
              <Button
                variant="outlined"
                sx={{ mr: 1, mb: 1 }}
                onClick={() => setActiveTab("students")}
              >
                My Students (Current Cohort)
              </Button>
              <Button
                variant="outlined"
                color="error"
                sx={{ mb: 1 }}
                onClick={handleLogout}
              >
                Logout
              </Button>
              <Typography sx={{ mt: 2 }} color="text.secondary">
                Old password is required before setting a new password.
              </Typography>
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
                cohortId={cohortId}
                courseId={selectedCourseId}
                videos={myVideos}
                documents={myDocuments}
                user={user}
                chatMessages={chatMessages}
                updateChatMessages={updateChatMessages}
                setMessages={setMessages}
                socketRef={socketRef}
                messages={messages}
                openChat={openChat}
                unreadCount={unreadCount}
              />
            )}
          </Box>
        )}
      </Box>
      <Drawer
        anchor="right"
        open={isMobile && chatOpen}
        onClose={closeChat}
        ModalProps={{
          disableRestoreFocus: true,
        }}
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
            <IconButton onClick={closeChat}>
              <CloseIcon />
            </IconButton>
          </Box>

          <ChatSidebarLocal
            cohortId={cohortId}
            courseId={selectedCourseId}
            videos={myVideos}
            documents={myDocuments}
            chatMessages={chatMessages}
            updateChatMessages={updateChatMessages}
            user={user}
            setMessages={setMessages}
            socketRef={socketRef}
            messages={messages}
            openChat={openChat}
            unreadCount={unreadCount}
          />
        </Box>
      </Drawer>
      {isMobile && (
        <MobileBottomNav
          value={
            activeTab === "upload-video" ||
            activeTab === "upload-doc" ||
            activeTab === "upload-sl-doc" ||
            activeTab === "upload-free-learning-doc"
              ? "courses"
              : activeTab
          }
          onChange={(next) => {
            if (next === "courses") setActiveTab("upload-doc");
            else if (next === "more") setActiveTab("more");
            else if (next === "profile") window.location.href = "/profile";
            else setActiveTab(next);
          }}
          onProfile={() => {
            window.location.href = "/profile";
          }}
          chatUnreadCount={chatUnreadCount}
          moreActions={[
            { label: "My Students", onClick: () => setActiveTab("students") },
            {
              label: "Change Password",
              onClick: () => {
                window.location.href = "/profile";
              },
            },
            { label: "Logout", onClick: handleLogout },
          ]}
        />
      )}
    </Box>
  );
};

export default CoachDashboard;
