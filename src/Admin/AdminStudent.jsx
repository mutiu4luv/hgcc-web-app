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
  Chip,
  Stack,
} from "@mui/material";
import { Grid, Card, CardContent, CardMedia, CardActions } from "@mui/material";

import {
  Dashboard,
  AssignmentTurnedIn,
  UploadFile,
  Menu as MenuIcon,
  Close as CloseIcon,
  Logout,
  StarRate,
  LiveTv,
  School,
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
import { toast } from "react-toastify";

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
  const [proof, setProof] = useState(null);

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
  const [liveSession, setLiveSession] = useState(null);
  const [loadingLive, setLoadingLive] = useState(false);
  const [liveCourseId, setLiveCourseId] = useState(null);

  const [selfLearningCourses, setSelfLearningCourses] = useState([]);
  const [loadingSelfLearning, setLoadingSelfLearning] = useState(false);
  const [registeringCourseId, setRegisteringCourseId] = useState(null);
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [selectedSelfLearningCourse, setSelectedSelfLearningCourse] =
    useState("");
  const [registeringCourse, setRegisteringCourse] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  const [courseContents, setCourseContents] = useState([]);
  const [loadingContents, setLoadingContents] = useState(false);
  const [contentError, setContentError] = useState("");
  const [paidCourses, setPaidCourses] = useState([]);
  const [selectedMarketplaceCourse, setSelectedMarketplaceCourse] =
    useState("");
  const [selectedPaidCourse, setSelectedPaidCourse] = useState("");

  const [freeCourses, setFreeCourses] = useState([]);
  const [myFreeCourses, setMyFreeCourses] = useState([]);
  const [selectedMyFreeCourse, setSelectedMyFreeCourse] = useState("");
  const [freeCourseContents, setFreeCourseContents] = useState([]);

  const hasPaid = paidCourses.some(
    (c) => String(c.courseId) === String(selectedMarketplaceCourse)
  );
  // FETCH FREE COURSES (MARKETPLACE)
  const fetchFreeCourses = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/free-learning/free-courses`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFreeCourses(res.data.courses || []);
      console.log("free course fetched", res);
    } catch {
      toast.error("Failed to load free courses");
    }
  };

  useEffect(() => {
    if (activeTab === "free-learning") {
      fetchFreeCourses();
      fetchMyFreeCourses();
    }
  }, [activeTab]);

  // FETCH MY FREE COURSES (REGISTERED)
  const fetchMyFreeCourses = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/free-learning/free-courses/my`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMyFreeCourses(res.data.courses || []);
    } catch {
      toast.error("Failed to load your free courses");
    }
  };
  // REGISTER FREE COURSE
  const handleRegisterFreeCourse = async () => {
    if (!selectedMarketplaceCourse) {
      toast.warning("Select a course first");
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/api/free-learning/free-courses/${selectedMarketplaceCourse}/register`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Registered successfully 🎉");
      setSelectedMarketplaceCourse("");
      fetchMyFreeCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  // FETCH FREE COURSE CONTENT (REGISTERED ONLY)
  const fetchFreeCourseContents = async (courseId) => {
    try {
      setLoadingContents(true);
      const res = await axios.get(
        `${BASE_URL}/api/free-learning/free-courses/${courseId}/contents`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFreeCourseContents(res.data.contents || []);
    } catch {
      toast.error("Failed to load course materials");
    } finally {
      setLoadingContents(false);
    }
  };

  useEffect(() => {
    if (selectedMyFreeCourse) {
      fetchFreeCourseContents(selectedMyFreeCourse);
    } else {
      setFreeCourseContents([]);
    }
  }, [selectedMyFreeCourse]);

  const [text, setText] = useState("");
  const chatEndRef = useRef(null);

  const fetchMyPaidCourses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/self-learning/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPaidCourses(res.data.courses || []);
      console.log(res);
    } catch (err) {
      console.error("Failed to load paid courses");
    }
  };

  useEffect(() => {
    if (!selectedPaidCourse) return;
    fetchCourseContents(selectedPaidCourse);
  }, [selectedPaidCourse]);

  useEffect(() => {
    if (activeTab !== "self-learning") return;

    fetchMyPaidCourses();

    const fetchSelfLearningCourses = async () => {
      try {
        setLoadingSelfLearning(true);
        const res = await axios.get(`${BASE_URL}/api/self-learning/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSelfLearningCourses(res.data.courses || []);
      } catch (err) {
        setMessage("Failed to load self-learning courses");
      } finally {
        setLoadingSelfLearning(false);
      }
    };

    fetchSelfLearningCourses();
  }, [activeTab]);

  // fetch students content
  useEffect(() => {
    if (activeTab !== "self-learning") return;

    fetchMyPaidCourses();

    const fetchSelfLearningCourses = async () => {
      try {
        setLoadingSelfLearning(true);
        const res = await axios.get(`${BASE_URL}/api/self-learning/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSelfLearningCourses(res.data.courses || []);
      } catch (err) {
        setMessage("Failed to load self-learning courses");
      } finally {
        setLoadingSelfLearning(false);
      }
    };

    fetchSelfLearningCourses();
  }, [activeTab]);

  const fetchCourseContents = async (courseId) => {
    try {
      setLoadingContents(true);
      setContentError("");

      const res = await axios.get(
        `${BASE_URL}/api/self-learning/course/${courseId}/contents`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCourseContents(res.data.contents || []);
    } catch (err) {
      setContentError(
        err.response?.data?.message || "Failed to load course materials"
      );
      setCourseContents([]);
    } finally {
      setLoadingContents(false);
    }
  };

  useEffect(() => {
    if (!selectedSelfLearningCourse) {
      setCourseContents([]);
      return;
    }

    if (!hasPaid) {
      setCourseContents([]);
      return;
    }

    fetchCourseContents(selectedSelfLearningCourse);
  }, [selectedSelfLearningCourse, hasPaid]);

  //  Trigger fetch when student selects a course AND is registered
  useEffect(() => {
    if (
      selectedSelfLearningCourse &&
      registeredCourses.includes(selectedSelfLearningCourse)
    ) {
      fetchCourseContents(selectedSelfLearningCourse);
    } else {
      setCourseContents([]);
    }
  }, [selectedSelfLearningCourse, registeredCourses]);

  // FETCH SELF-LEARNING COURSES
  useEffect(() => {
    if (activeTab !== "self-learning") return;

    const fetchSelfLearningCourses = async () => {
      try {
        setLoadingSelfLearning(true);
        const res = await axios.get(`${BASE_URL}/api/self-learning/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSelfLearningCourses(res.data.courses || []);
      } catch (err) {
        setMessage("Failed to load self-learning courses");
      } finally {
        setLoadingSelfLearning(false);
      }
    };

    fetchSelfLearningCourses();
  }, [activeTab]);

  // set default live course id
  useEffect(() => {
    if (courses.length > 0) {
      // If courses come from cohort.courses, use _id
      setLiveCourseId(courses[0].courseId);
    }
  }, [courses]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = user?._id || user?.id;

  const socketRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const now = new Date();

  const unlockedVideo = videos.find((v) => {
    const unlockAt = new Date(v.unlockAt);
    const expireAt = new Date(unlockAt.getTime() + 3 * 60 * 60 * 1000);
    return now >= unlockAt && now <= expireAt;
  });

  const unlockedDocument = documents.find((d) => new Date(d.unlockAt) <= now);

  // video has priority
  const activeMaterial = unlockedVideo || unlockedDocument;

  // extract REAL courseId
  const activeCourseId =
    activeMaterial &&
    (typeof activeMaterial.courseId === "object"
      ? activeMaterial.courseId._id
      : activeMaterial.courseId);

  const canShowChat = Boolean(cohortId && activeCourseId);

  const getSenderName = (m) => {
    if (typeof m.senderId === "object") return m.senderId.fullName;
    if (m.senderId === currentUserId) return currentUser.fullName || "You";
    return "Coach";
  };

  // fetch live class status
  useEffect(() => {
    // ✅ guard logic INSIDE effect
    if (activeTab !== "join-live") return;
    if (!cohortId || !liveCourseId) return;

    const token = localStorage.getItem("token");

    const fetchLiveSession = async () => {
      try {
        setLoadingLive(true);

        const res = await fetch(
          `${BASE_URL}/api/live/${cohortId}/${liveCourseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        console.log("✅ Live session data:", data);

        setLiveSession(data);
      } catch (err) {
        console.error("❌ Live session error:", err);
        setLiveSession({ isLive: false });
      } finally {
        setLoadingLive(false);
      }
    };

    fetchLiveSession();

    // ✅ polling
    const interval = setInterval(fetchLiveSession, 10000);

    return () => clearInterval(interval);
  }, [activeTab, cohortId, liveCourseId]);

  // Auto-scroll chat to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("token");

  const isMobile = useMediaQuery("(max-width:900px)");

  const navigate = useNavigate();

  // REGISTER FOR SELF-LEARNING COURSE
  const handleRegisterSelfLearning = async () => {
    if (!selectedMarketplaceCourse) {
      setMessage("Please select a course first");
      return;
    }

    if (registeredCourses.includes(selectedMarketplaceCourse)) {
      setMessage("You are already registered for this course");
      return;
    }

    try {
      setRegisteringCourse(true);

      console.log("Registering course:", selectedMarketplaceCourse);

      await axios.post(
        `${BASE_URL}/api/self-learning/course/${selectedMarketplaceCourse}/register`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRegisteredCourses((prev) => [...prev, selectedMarketplaceCourse]);
      toast.update("register", {
        render: "✅ Registered successfully. Proceed to payment.",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      setMessage("✅ Registered successfully. Proceed to payment.");
      navigate(`/student/payment/${selectedMarketplaceCourse}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load self-learning courses");

      setMessage(err.response?.data?.message || "Registration failed");
    } finally {
      setRegisteringCourse(false);
    }
  };

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, key: "dashboard" },
    {
      text: "My Assignments",
      icon: <AssignmentTurnedIn />,
      key: "assignments",
    },
    { text: "Rate Coach", icon: <StarRate />, key: "rate-coach" },
    {
      text: "Register Cohort Course",
      icon: <AssignmentTurnedIn />,
      key: "register-course",
    },
    { text: "Self Learning", icon: <School />, key: "self-learning" },
    { text: "Free Learning", icon: <School />, key: "free-learning" },
    { text: "Join Cohort Class", icon: <Videocam />, key: "join-class" },
    { text: "Join Live Class", icon: <LiveTv />, key: "join-live" },
  ];
  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/cohort/available`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.cohorts?.length > 0) {
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
    if (!canShowChat || !text.trim()) return;

    const res = await fetch(
      `${BASE_URL}/api/cohort-chat/${cohortId}/${activeCourseId}/message`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Send failed:", data);
      return;
    }

    setChatMessages((prev) => [...prev, data]);
    setText("");
  };

  // for live video google meet link
  useEffect(() => {
    if (!socketRef.current) return;

    const handleLiveStarted = (payload) => {
      console.log("🔴 Live started:", payload);

      setLiveSession({
        isLive: true,
        meetLink: payload.meetLink,
      });
    };

    socketRef.current.on("liveStarted", handleLiveStarted);

    return () => {
      socketRef.current.off("liveStarted", handleLiveStarted);
    };
  }, []);

  // Chat socket for cohort messages
  useEffect(() => {
    if (!canShowChat) return;

    const socket = io(BASE_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.emit("joinCohort", {
      room: `${cohortId}:${activeCourseId}`,
    });

    socket.on("cohortMessage", (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [cohortId, activeCourseId]);

  // Fetch cohort chat messages

  useEffect(() => {
    if (!canShowChat) return;

    fetch(`${BASE_URL}/api/cohort-chat/${cohortId}/${activeCourseId}/message`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setChatMessages(Array.isArray(data.messages) ? data.messages : []);
      })
      .catch(console.error);
  }, [cohortId, activeCourseId]);
  // for time in documents
  const formatNigeriaTime = (date) =>
    new Date(date).toLocaleString("en-NG", {
      timeZone: "Africa/Lagos",
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  // Fetch documents for student

  const fetchDocuments = async () => {
    try {
      setLoadingDocuments(true);

      const { data } = await axios.get(`${BASE_URL}/api/coach/doc`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // console.log("📄 Fetched documents", data);

      const allDocs = [
        ...(data.unlockedMaterials || []),
        ...(data.upcomingMaterials || []),
      ].map((doc) => {
        // 1. Create Date objects from UTC strings
        const unlockDate = new Date(doc.unlockAt);
        const createdDate = new Date(doc.createdAt);

        return {
          ...doc,
          courseName:
            typeof doc.courseId === "object"
              ? doc.courseId.name
              : courses.find((c) => c._id === doc.courseId)?.name || "Unknown",

          // 🔑 THE FIX: Convert back to Nigeria Time for display
          // This will show exactly what you chose in the upload form
          displayUnlockAt: unlockDate.toLocaleString("en-GB", {
            timeZone: "Africa/Lagos",
            hour: "2-digit",
            minute: "2-digit",
          }),

          // 🔑 THE FIX: Get the original post time in Nigeria Time
          displayPostedAt: createdDate.toLocaleString("en-GB", {
            timeZone: "Africa/Lagos",
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),

          // Normalize timestamps for logic comparisons
          unlockAtMs: unlockDate.getTime(),
          createdAtMs: createdDate.getTime(),
        };
      });

      setDocuments(allDocs);
      // setNextClass(data.nextClass || null);
      const now = Date.now();

      const next =
        (data.upcomingMaterials || [])
          .filter((m) => m.unlockAt && new Date(m.unlockAt).getTime() > now)
          .sort(
            (a, b) =>
              new Date(a.unlockAt).getTime() - new Date(b.unlockAt).getTime()
          )[0] || null;

      setNextClass(next);
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

  // const fetchDocuments = async () => {
  //   try {
  //     setLoadingDocuments(true);

  //     const { data } = await axios.get(`${BASE_URL}/api/coach/doc`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     console.log("📄 Fetched documents", data);

  //     const allDocs = [
  //       ...(data.unlockedMaterials || []),
  //       ...(data.upcomingMaterials || []),
  //     ].map((doc) => ({
  //       ...doc,
  //       courseName:
  //         typeof doc.courseId === "object"
  //           ? doc.courseId.name
  //           : courses.find((c) => c._id === doc.courseId)?.name || "Unknown",

  //       // 🔑 normalize timestamps once
  //       unlockAtMs: new Date(doc.unlockAt).getTime(),
  //       createdAtMs: new Date(doc.createdAt).getTime(),
  //     }));

  //     setDocuments(allDocs);
  //     setNextClass(data.nextClass || null);
  //     setNextClassCountdown(data.nextClassCountdown || "");
  //   } catch (err) {
  //     console.error("❌ Error fetching documents:", err);
  //     setDocuments([]);
  //     setNextClass(null);
  //     setNextClassCountdown("");
  //   } finally {
  //     setLoadingDocuments(false);
  //   }
  // };

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
      // console.log("Fetched videos:", data);
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
        // console.log(res.data.cohorts);

        if (res.data.cohorts) {
          setActiveCohorts(res.data.cohorts);
        } else {
          // setMessage(res.data.message || "Unknown response");
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
                grade: "-",
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

      // console.log("Coaches:", res.data.coaches);

      setCoaches(res.data.coaches);
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
    if (!proof) {
      setMessage("Please upload proof of payment");
      return;
    }

    try {
      setRegisterLoading(true);

      const formData = new FormData();
      formData.append("courseId", courseId);
      formData.append("proof", proof);

      const res = await axios.post(
        `${BASE_URL}/api/cohort/student/register-cohort/${cohortId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(res.data.message);
      setSuccessModalOpen(true);
      setProof(null);
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      setMessage(err?.response?.data?.message || "Registration failed");
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
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
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
            // ml: isMobile ? 0 : `${drawerWidth}px`,
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
                <Paper
                  sx={{ flex: 1, p: 2, minWidth: 200, bgcolor: "#d1fae5" }}
                >
                  <Typography variant="h6">Assignments</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {assignments.length}
                  </Typography>
                </Paper>

                <Paper
                  sx={{ flex: 1, p: 2, minWidth: 200, bgcolor: "#fef9c3" }}
                >
                  <Typography variant="h6">My Submissions</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {
                      assignments.filter(
                        (a) => a.status?.toLowerCase() === "submitted"
                      ).length
                    }
                  </Typography>
                </Paper>

                <Paper
                  sx={{ flex: 1, p: 2, minWidth: 200, bgcolor: "#bfdbfe" }}
                >
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
                <Paper
                  sx={{ flex: 1, minWidth: 300, p: 2, bgcolor: "#fef2f2" }}
                >
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
                <Paper
                  sx={{ flex: 1, minWidth: 300, p: 2, bgcolor: "#e0f2fe" }}
                >
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
                          const minutes = Math.floor(
                            (totalSeconds % 3600) / 60
                          );
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
                                courses.find(
                                  (c) => c._id === video.courseId?._id
                                )?.name || "Unknown";

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
                                    Course: {video.name || courseName}
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
                                      Your browser does not support the video
                                      tag.
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
                    const isUnlocked = unlockAt;
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
                            {/* <Typography
                              variant="caption"
                              sx={{ display: "block", mt: 1, color: "gray" }}
                            >
                              Video is available for 3 hours only.
                            </Typography> */}
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
                  {documents.map((doc) => (
                    <Paper key={doc._id} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        📄 {doc.title}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        Posted on: {doc.displayPostedAt} (WAT)
                      </Typography>

                      {doc.fileUrl ? (
                        <>
                          <Typography
                            sx={{ mt: 1, color: "green", fontWeight: "bold" }}
                          >
                            ✅ Content Available
                          </Typography>

                          <Button
                            variant="outlined"
                            sx={{ mt: 1 }}
                            onClick={() => window.open(doc.fileUrl, "_blank")}
                          >
                            📥 Open Document
                          </Button>
                        </>
                      ) : (
                        <Typography
                          sx={{ mt: 1, color: "orange", fontWeight: "bold" }}
                        >
                          🔒 Unlocks at: {doc.displayUnlockAt} (Nigeria Time)
                        </Typography>
                      )}
                    </Paper>
                  ))}
                  {/* Class chat - only if any material is unlocked */}
                  {canShowChat && (
                    <Box
                      sx={{
                        mt: 2,
                        border: "1px solid #e0e0e0",
                        borderRadius: 3,
                        p: 2,
                        bgcolor: "#fafafa",
                        maxWidth: 500,
                      }}
                    >
                      <Typography fontWeight="bold" sx={{ mb: 1 }}>
                        💬 Cohort Chat
                      </Typography>

                      {/* Messages */}
                      <Box
                        sx={{
                          maxHeight: 300,
                          overflowY: "auto",
                          p: 1,
                          mb: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        {chatMessages.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No messages yet. Say hi 👋
                          </Typography>
                        ) : (
                          chatMessages.map((m, i) => {
                            const isMe =
                              (typeof m.senderId === "object"
                                ? m.senderId._id
                                : m.senderId) === currentUserId;

                            return (
                              <Box
                                key={m._id || i}
                                sx={{
                                  display: "flex",
                                  justifyContent: isMe
                                    ? "flex-end"
                                    : "flex-start",
                                }}
                              >
                                <Box
                                  sx={{
                                    maxWidth: "75%",
                                    p: 1.2,
                                    borderRadius: 2,
                                    bgcolor: isMe ? "#d1e7ff" : "#ffffff",
                                    boxShadow: 1,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontWeight: "bold",
                                      display: "block",
                                    }}
                                  >
                                    {getSenderName(m)}
                                  </Typography>
                                  <Typography variant="body2">
                                    {m.text}
                                  </Typography>
                                </Box>
                              </Box>
                            );
                          })
                        )}
                        <div ref={chatEndRef} />
                      </Box>

                      {/* Input */}
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          placeholder="Type a message..."
                          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <Button variant="contained" onClick={sendMessage}>
                          Send
                        </Button>
                      </Box>
                    </Box>
                  )}
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
                            <Typography fontWeight="bold">
                              Upload File
                            </Typography>
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
          {/* Register cohort Course */}
          {activeTab === "register-course" && (
            <Paper sx={{ p: 4 }}>
              {cohortLoading ? (
                <Stack alignItems="center" sx={{ py: 5 }}>
                  <CircularProgress />
                  <Typography sx={{ mt: 2 }}>Loading cohorts...</Typography>
                </Stack>
              ) : !Array.isArray(activeCohorts) ||
                activeCohorts.length === 0 ? (
                <Typography variant="h5" color="error">
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
                    📝 Register for a Cohort
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

                  {/* ===================== */}
                  {/* 🔹 COHORT SELECT */}
                  {/* ===================== */}
                  <TextField
                    select
                    label="Choose Cohort"
                    fullWidth
                    value={selectedCohort || ""}
                    onChange={(e) => {
                      setSelectedCohort(e.target.value);
                      setSelectedCourse("");
                    }}
                    sx={{ mb: 3 }}
                  >
                    <MenuItem value="">-- Select Cohort --</MenuItem>
                    {activeCohorts.map((cohort) => (
                      <MenuItem key={cohort.cohortId} value={cohort.cohortId}>
                        {cohort.cohortName}
                      </MenuItem>
                    ))}
                  </TextField>

                  {/* ===================== */}
                  {/* 🔹 COURSE PREVIEW */}
                  {/* ===================== */}
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
                            sx={{ mb: 3 }}
                          >
                            <MenuItem value="">-- Select Course --</MenuItem>
                            {coursesList.map((course) => (
                              <MenuItem key={course._id} value={course._id}>
                                {course.name} ({course.category}) –{" "}
                                {course.durationInDays} days
                              </MenuItem>
                            ))}
                          </TextField>

                          {/* COURSE CARD PREVIEW */}
                          {selectedCourse &&
                            (() => {
                              const course = coursesList.find(
                                (c) => c._id === selectedCourse
                              );
                              if (!course) return null;

                              return (
                                <Card
                                  sx={{
                                    display: "flex",
                                    mb: 3,
                                    borderRadius: 3,
                                    boxShadow: 3,
                                  }}
                                >
                                  <CardMedia
                                    component="img"
                                    image={
                                      course.image || "/course-placeholder.png"
                                    }
                                    alt={course.name}
                                    sx={{ width: 240, objectFit: "cover" }}
                                  />

                                  <CardContent sx={{ flex: 1 }}>
                                    <Typography variant="h6" fontWeight="bold">
                                      {course.name}
                                    </Typography>

                                    <Typography
                                      color="text.secondary"
                                      sx={{ my: 1 }}
                                    >
                                      {course.description ||
                                        "No description provided."}
                                    </Typography>

                                    <Stack
                                      direction="row"
                                      spacing={2}
                                      sx={{ mt: 2 }}
                                    >
                                      <Chip
                                        label={course.category}
                                        color="primary"
                                      />
                                      <Chip
                                        label={`${course.durationInDays} days`}
                                        variant="outlined"
                                      />
                                    </Stack>
                                  </CardContent>
                                </Card>
                              );
                            })()}

                          {/* ===================== */}
                          {/* 💳 PAYMENT INSTRUCTIONS */}
                          {/* ===================== */}
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 3,
                              mb: 3,
                              borderRadius: 2,
                              backgroundColor: "#f9fafb",
                            }}
                          >
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              gutterBottom
                            >
                              💳 Payment Instructions
                            </Typography>

                            <Typography variant="body2" sx={{ mb: 1 }}>
                              Please make your payment to the account below and
                              upload your proof of payment to complete your
                              registration.
                            </Typography>

                            <Typography variant="body2">
                              <strong>Account Name:</strong> HGSC2 Digital
                              Skills Academy Ltd
                            </Typography>
                            <Typography variant="body2">
                              <strong>Account Number:</strong> 0102263405
                            </Typography>
                            <Typography variant="body2">
                              <strong>Bank:</strong> Sterling Bank
                            </Typography>
                          </Paper>

                          {/* ===================== */}
                          {/* 📤 UPLOAD PROOF */}
                          {/* ===================== */}
                          <Button
                            variant="outlined"
                            component="label"
                            sx={{ mb: 2 }}
                          >
                            Upload Proof of Payment
                            <input
                              type="file"
                              hidden
                              accept="image/*,.pdf"
                              onChange={(e) => setProof(e.target.files[0])}
                            />
                          </Button>

                          {proof && (
                            <Typography
                              variant="body2"
                              color="green"
                              sx={{ mb: 2 }}
                            >
                              ✔ {proof.name}
                            </Typography>
                          )}

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
                            {registerLoading
                              ? "Registering..."
                              : "Submit Registration"}
                          </Button>
                        </>
                      );
                    })()}
                </>
              )}
            </Paper>
          )}

          {/* JOIN LIVE CLASS */}
          {activeTab === "join-live" && (
            <Paper sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="bold" color="error">
                🔴 Live Class
              </Typography>

              {loadingLive ? (
                <Typography sx={{ mt: 2 }}>Checking live session...</Typography>
              ) : !liveSession?.isLive ? (
                <Typography sx={{ mt: 2 }}>
                  ⏳ No live class is currently running.
                </Typography>
              ) : (
                <>
                  <Typography sx={{ mt: 2 }}>
                    Your instructor has started a live class.
                  </Typography>

                  <Button
                    variant="contained"
                    color="success"
                    sx={{ mt: 3 }}
                    onClick={() =>
                      window.open(
                        liveSession.meetLink,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  >
                    Join Google Meet
                  </Button>
                </>
              )}
            </Paper>
          )}

          {/* SELF LEARNING TAB */}
          {activeTab === "self-learning" && (
            <Paper sx={{ p: 4 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                📚 Self-Learning Courses
              </Typography>

              {/* ===================== */}
              {/* 🔹 BROWSE & REGISTER */}
              {/* ===================== */}
              <Typography fontWeight="bold" sx={{ mb: 1 }}>
                Browse & Register
              </Typography>

              <TextField
                select
                fullWidth
                label="Select Course"
                value={selectedMarketplaceCourse}
                onChange={(e) => setSelectedMarketplaceCourse(e.target.value)}
                sx={{ mb: 3 }}
              >
                <MenuItem value="">-- Select Course --</MenuItem>
                {selfLearningCourses.map((course) => (
                  <MenuItem key={course._id} value={course._id}>
                    {course.title} — ₦{course.price}
                  </MenuItem>
                ))}
              </TextField>

              {/* SELECTED COURSE CARD */}
              {selectedMarketplaceCourse &&
                (() => {
                  const course = selfLearningCourses.find(
                    (c) => c._id === selectedMarketplaceCourse
                  );
                  if (!course) return null;

                  return (
                    <Card
                      sx={{
                        display: "flex",
                        mb: 3,
                        borderRadius: 3,
                        boxShadow: 3,
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={course.image || "/course-placeholder.png"}
                        alt={course.title}
                        sx={{
                          width: 220,
                          objectFit: "cover",
                        }}
                      />

                      <CardContent sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold">
                          {course.title}
                        </Typography>

                        <Typography color="text.secondary" sx={{ my: 1 }}>
                          {course.description}
                        </Typography>

                        <Chip
                          label={`₦${course.price}`}
                          color="success"
                          sx={{ fontWeight: "bold" }}
                        />
                      </CardContent>
                    </Card>
                  );
                })()}

              <Button
                variant="contained"
                color={hasPaid ? "success" : "primary"}
                disabled={
                  !selectedMarketplaceCourse || hasPaid || registeringCourse
                }
                onClick={handleRegisterSelfLearning}
                sx={{ mb: 5 }}
              >
                {registeringCourse
                  ? "Registering..."
                  : hasPaid
                  ? "Paid & Active"
                  : "Register"}
              </Button>

              {/* ===================== */}
              {/* 🔹 PAID COURSES */}
              {/* ===================== */}
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                🎓 My Paid Courses
              </Typography>

              <TextField
                select
                fullWidth
                label="Select Paid Course"
                value={selectedPaidCourse}
                onChange={(e) => setSelectedPaidCourse(e.target.value)}
                sx={{ mb: 3 }}
              >
                <MenuItem value="">-- Select Course --</MenuItem>
                {paidCourses.map((course) => (
                  <MenuItem key={course.courseId} value={course.courseId}>
                    {course.title}
                  </MenuItem>
                ))}
              </TextField>

              {/* PAID COURSE CARD */}
              {selectedPaidCourse &&
                (() => {
                  const course = paidCourses.find(
                    (c) => String(c.courseId) === String(selectedPaidCourse)
                  );
                  if (!course) return null;

                  return (
                    <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 2 }}>
                      <CardMedia
                        component="img"
                        height="220"
                        image={course.image || "/course-placeholder.png"}
                        alt={course.title}
                      />

                      <CardContent>
                        <Typography variant="h6" fontWeight="bold">
                          {course.title}
                        </Typography>

                        <Typography color="text.secondary" sx={{ mb: 1 }}>
                          {course.description}
                        </Typography>

                        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                          <Chip label={`₦${course.price}`} color="primary" />
                          <Chip
                            label={`Coach: ${course.coach?.fullName || "N/A"}`}
                            variant="outlined"
                          />
                          <Chip
                            label={`Payment: ${
                              course.payment?.status || "approved"
                            }`}
                            color="success"
                          />
                        </Stack>
                      </CardContent>
                    </Card>
                  );
                })()}

              {/* ===================== */}
              {/* 🔹 COURSE CONTENTS */}
              {/* ===================== */}
              {selectedPaidCourse && (
                <Paper sx={{ mt: 4, p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    📂 Course Materials
                  </Typography>

                  {loadingContents ? (
                    <Stack alignItems="center" sx={{ my: 4 }}>
                      <CircularProgress />
                      <Typography sx={{ mt: 1 }}>
                        Loading materials...
                      </Typography>
                    </Stack>
                  ) : contentError ? (
                    <Alert severity="warning">{contentError}</Alert>
                  ) : courseContents.length === 0 ? (
                    <Alert severity="info">No materials uploaded yet.</Alert>
                  ) : (
                    courseContents.map((item) => (
                      <Card key={item._id} sx={{ mb: 3, borderRadius: 2 }}>
                        <CardContent>
                          <Typography fontWeight="bold">
                            {item.title}
                          </Typography>

                          {item.type === "document" && (
                            <iframe
                              src={`${item.url}#toolbar=0`}
                              width="100%"
                              height="420"
                              style={{
                                border: "none",
                                marginTop: 12,
                                borderRadius: 8,
                              }}
                            />
                          )}

                          {item.type === "video" && (
                            <video
                              src={item.url}
                              controls
                              controlsList="nodownload"
                              style={{
                                width: "100%",
                                marginTop: 12,
                                borderRadius: 8,
                              }}
                            />
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Paper>
              )}
            </Paper>
          )}

          {activeTab === "free-learning" && (
            <Paper sx={{ p: 4 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                🎁 Free Courses
              </Typography>

              {/* ================= MARKETPLACE ================= */}
              <Typography fontWeight="bold" sx={{ mb: 2 }}>
                Browse & Register
              </Typography>

              <Grid container spacing={3}>
                {freeCourses.map((course) => {
                  const isSelected = selectedMarketplaceCourse === course._id;

                  return (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={3}
                      key={course._id}
                      sx={{ display: "flex", justifyContent: "center" }}
                    >
                      <Card
                        onClick={() => setSelectedMarketplaceCourse(course._id)}
                        sx={{
                          width: 280,
                          height: 430,
                          display: "flex",
                          flexDirection: "column",
                          cursor: "pointer",
                          borderRadius: 3,
                          border: isSelected
                            ? "2px solid #16a34a"
                            : "1px solid #e5e7eb",
                          boxShadow: isSelected
                            ? "0 10px 28px rgba(22,163,74,0.35)"
                            : "0 4px 14px rgba(0,0,0,0.1)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-6px)",
                            boxShadow: "0 14px 34px rgba(0,0,0,0.18)",
                          },
                        }}
                      >
                        {/* ================= IMAGE ================= */}
                        <Box
                          sx={{
                            height: 160,
                            minHeight: 160,
                            maxHeight: 160,
                            overflow: "hidden",
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={
                              course.image ||
                              "https://via.placeholder.com/400x200?text=Free+Course"
                            }
                            alt={course.title}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>

                        {/* ================= CONTENT ================= */}
                        <CardContent
                          sx={{
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            overflow: "hidden",
                          }}
                        >
                          <Typography fontWeight="bold" noWrap>
                            {course.title}
                          </Typography>

                          {/* DESCRIPTION — NEVER RESIZES CARD */}
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              height: 66,
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {course.description}
                          </Typography>

                          <Typography sx={{ fontSize: 13, color: "gray" }}>
                            Coach: {course.coachId?.fullName || "N/A"}
                          </Typography>

                          <Typography
                            fontWeight="bold"
                            sx={{ color: "#16a34a", mt: "auto" }}
                          >
                            FREE 🎉
                          </Typography>
                        </CardContent>

                        {/* ================= ACTION ================= */}
                        <CardActions sx={{ px: 2, pb: 2 }}>
                          <Button
                            fullWidth
                            variant={isSelected ? "contained" : "outlined"}
                            color="success"
                          >
                            {isSelected ? "Selected" : "Select Course"}
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>

              {/* ================= REGISTER ================= */}
              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={!selectedMarketplaceCourse}
                  onClick={handleRegisterFreeCourse}
                >
                  Register Selected Course (Free)
                </Button>
              </Box>

              {/* ================= MY FREE COURSES ================= */}
              <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
                sx={{ mt: 6 }}
              >
                📚 My Free Courses
              </Typography>

              <TextField
                select
                fullWidth
                label="Select My Course"
                value={selectedMyFreeCourse}
                onChange={(e) => setSelectedMyFreeCourse(e.target.value)}
                sx={{ mb: 3 }}
              >
                <MenuItem value="">-- Select Course --</MenuItem>
                {myFreeCourses.map((course) => (
                  <MenuItem key={course.courseId} value={course.courseId}>
                    {course.title}
                  </MenuItem>
                ))}
              </TextField>

              {/* ================= CONTENT ================= */}
              {selectedMyFreeCourse && (
                <Paper sx={{ mt: 4, p: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    📂 Course Materials
                  </Typography>

                  {loadingContents ? (
                    <CircularProgress />
                  ) : freeCourseContents.length === 0 ? (
                    <Typography color="gray">No materials yet</Typography>
                  ) : (
                    freeCourseContents.map((item) => (
                      <Paper key={item._id} sx={{ p: 2, mb: 2 }}>
                        <Typography fontWeight="bold">{item.title}</Typography>

                        {item.type === "document" && (
                          <iframe
                            src={`${item.url}#toolbar=0`}
                            width="100%"
                            height="400"
                            style={{ border: "none", marginTop: 10 }}
                          />
                        )}

                        {item.type === "video" && (
                          <video
                            src={item.url}
                            controls
                            style={{ width: "100%", marginTop: 10 }}
                          />
                        )}
                      </Paper>
                    ))
                  )}
                </Paper>
              )}
            </Paper>
          )}
        </Box>
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
          <Typography>your payment is being processed...</Typography>
        </Box>
      </Modal>
    </Box>
  );
};

export default StudentDashboard;
