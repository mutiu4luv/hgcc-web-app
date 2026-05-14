import React, { useState, useEffect, useMemo } from "react";
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
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
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
  Announcement,
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
import { toast } from "react-toastify";

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
  const [coachComments, setCoachComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
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
  const [pendingStudents, setPendingStudents] = useState([]);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);

  const [loadingCohorts, setLoadingCohorts] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [buttonType, setButtonType] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  const [success, setSuccess] = useState("");
  const [selfLearningCourses, setSelfLearningCourses] = useState([]);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [payments, setPayments] = useState([]);
  const [image, setImage] = useState(null);
  const [filterstudents, setFilterStudents] = useState([]); // ✅ DECLARED FIRST

  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [freeTitle, setFreeTitle] = useState("");
  const [freeDescription, setFreeDescription] = useState("");
  const [freeCourses, setFreeCourses] = useState([]);
  const [freeImage, setFreeImage] = useState(null);
  const [freeCoachId, setFreeCoachId] = useState("");
  const [creatingFree, setCreatingFree] = useState(false);
  const [loadingFreeCourses, setLoadingFreeCourses] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [student, setStudents] = useState([]);

  // ✅ Filter students by name, email, or phone number
  const filteredStudent = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return users

      .filter((user) => user?.role?.toLowerCase() === "student")

      .filter((student) => {
        if (!q) return true;

        return (
          student.fullName?.toLowerCase().includes(q) ||
          student.email?.toLowerCase().includes(q) ||
          student.phoneNumber?.includes(q)
        );
      });
  }, [users, searchQuery]);

  const isMobile = useMediaQuery("(max-width:900px)");
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const user = JSON.parse(localStorage.getItem("user"));

  const getEntityId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value._id || value.id || value.cohortId || value.courseId || "";
  };

  const normalizeCohortRecord = (record = {}) => {
    const cohortId = getEntityId(record.cohortId || record.cohort);
    const courseId = getEntityId(record.courseId || record.course);
    const proofOfPayment = record.proofOfPayment || {};
    const proofUrl =
      proofOfPayment.url ||
      record.proofUrl ||
      record.paymentProofUrl ||
      record.paymentProof?.url ||
      "";

    return {
      ...record,
      cohortId,
      courseId,
      courseName:
        record.courseName ||
        record.course?.title ||
        record.course?.name ||
        record.courseTitle ||
        "-",
      proofOfPayment: {
        ...proofOfPayment,
        url: proofUrl,
      },
    };
  };

  const normalizePendingPaymentRows = (items = []) => {
    return items.flatMap((item) => {
      const studentData =
        item.student ||
        item.user ||
        (typeof item.studentId === "object" ? item.studentId : null) ||
        item;

      const registrations = Array.isArray(item.registeredCohorts)
        ? item.registeredCohorts
        : Array.isArray(studentData?.registeredCohorts)
        ? studentData.registeredCohorts
        : [item.registeredCohort || item.registration || item];

      return registrations
        .filter(Boolean)
        .map((registration) => {
          const studentId =
            getEntityId(item.student || item.user || item.studentId) ||
            getEntityId(item.userId) ||
            getEntityId(studentData);
          const registeredCohort = normalizeCohortRecord({
            ...item,
            ...registration,
            cohortId: registration.cohortId || item.cohortId || item.cohort,
            courseId: registration.courseId || item.courseId || item.course,
            proofOfPayment:
              registration.proofOfPayment || item.proofOfPayment || {},
            proofUrl: registration.proofUrl || item.proofUrl,
          });
          const status =
            item.status ||
            registration.status ||
            registration.paymentStatus ||
            "";
          const paymentConfirmed =
            item.paymentConfirmed ??
            registration.paymentConfirmed ??
            String(status).toLowerCase() === "approved";

          return {
            ...item,
            _id: studentId,
            fullName:
              studentData?.fullName ||
              studentData?.name ||
              item.fullName ||
              item.name ||
              "Unknown student",
            email: studentData?.email || item.email || "-",
            phoneNumber:
              studentData?.phoneNumber ||
              studentData?.phone ||
              item.phoneNumber ||
              item.phone ||
              "-",
            paymentConfirmed,
            registeredCohort,
          };
        })
        .filter((row) => row._id && row.registeredCohort.courseId);
    });
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

  // FETCH STUDENTS COMMENTS FOR SELECTED COACH
  const fetchCoachComments = async (coachId) => {
    try {
      setLoadingComments(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${BASE_URL}/api/feedbacks/coach/${coachId}/comments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCoachComments(res.data.comments || []);
    } catch (err) {
      console.error("Failed to fetch coach comments", err);
      setCoachComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  // CREATE FREE COURSE HANDLER
  const handleCreateFreeCourse = async (e) => {
    e.preventDefault();

    if (!freeTitle || !freeDescription || !freeCoachId) {
      toast.warning("All fields are required");
      return;
    }

    try {
      setCreatingFree(true);

      const formData = new FormData();
      formData.append("title", freeTitle);
      formData.append("description", freeDescription);
      formData.append("coachId", freeCoachId);

      if (freeImage) {
        formData.append("image", freeImage);
      }

      const res = await axios.post(
        `${BASE_URL}/api/free-learning/free-courses`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("🖼 Free course image:", res.data.course.image);

      toast.success("Free course created successfully 🎉");

      setFreeTitle("");
      setFreeDescription("");
      setFreeCoachId("");
      setFreeImage(null);

      fetchFreeCourses();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to create free course"
      );
    } finally {
      setCreatingFree(false);
    }
  };

  // FETCH FREE COURSES
  const fetchFreeCourses = async () => {
    try {
      setLoadingFreeCourses(true);

      const res = await axios.get(
        `${BASE_URL}/api/free-learning/free-courses`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setFreeCourses(res.data.courses || []);
    } catch {
      toast.error("Failed to load free courses");
    } finally {
      setLoadingFreeCourses(false);
    }
  };

  // DELETE COURSE
  const handleDeleteFreeCourse = async (courseId) => {
    if (!window.confirm("Delete this free course?")) return;

    try {
      await axios.delete(
        `${BASE_URL}/api/free-learning/free-courses/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Free course deleted");
      fetchFreeCourses();
    } catch {
      toast.error("Failed to delete free course");
    }
  };

  // Confirm or Reject Self-Learning Payment Proof
  const handleAction = async (studentId, courseId, action) => {
    if (!window.confirm("Are you sure you want to proceed?")) return;

    try {
      setActionLoading(true);

      await axios.post(
        `${BASE_URL}/api/self-learning/payment/confirm`,
        { studentId, courseId, action },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(
        `Payment ${action === "approve" ? "approved" : "rejected"} successfully`
      );
      fetchPayments();
    } catch (err) {
      setMessage(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  // fetch when tab is open

  useEffect(() => {
    if (activeTab === "create-free-learning-course") {
      fetchFreeCourses();
    }
  }, [activeTab]);

  // fetch self-learning payment proofs
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/self-learning/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments(res.data.payments || []);
    } catch (err) {
      setMessage("Failed to load payment proofs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "confirm-self-learning-payment") {
      fetchPayments();
    }
  }, [activeTab]);

  // fetch self-learning courses
  const fetchSelfLearningCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/self-learning/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelfLearningCourses(res.data.courses || []);
      console.log(res.data.courses);
    } catch (err) {
      setMessage("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "create-self-learning-course") {
      fetchSelfLearningCourses();
    }
  }, [activeTab]);
  // Delete Self-Learning Course
  const handleDeleteSelfLearningCourse = async (courseId) => {
    if (!window.confirm("Delete this course?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/self-learning/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchSelfLearningCourses(); // 🔄 reload
    } catch (err) {
      alert("Failed to delete course");
    }
  };

  // Create Self-Learning Course

  const handleCreateCourse = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", Number(price));
      formData.append("coachId", assignedCoach);

      if (image) {
        formData.append("image", image);
      }

      const res = await axios.post(
        `${BASE_URL}/api/self-learning/course`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setTitle("");
      setDescription("");
      setPrice("");
      setImage(null);
      setMessage("✅ Course created successfully");

      fetchSelfLearningCourses();
    } catch (err) {
      console.error("❌ Create Course Error:", err.response?.data || err);
      setMessage(err.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  // fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoadingAnnouncements(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/announcement`
        );
        setAnnouncements(res.data.announcements || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAnnouncements(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // DELETE announcement
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?"))
      return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/announcement/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }, // CEO token
        }
      );
      setAnnouncements(announcements.filter((a) => a._id !== id));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete announcement");
    }
  };

  // handle submit announcement
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/announcement`,
        {
          title,
          message,
          button: buttonType || null,

          // Send EXACTLY ONE link, and others must be null
          whatsappLink: buttonType === "whatsapp" ? buttonLink : null,
          telegramLink: buttonType === "telegram" ? buttonLink : null,
          youtubeLink: buttonType === "youtube" ? buttonLink : null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("Announcement created successfully!");
      setTitle("");
      setMessage("");
      setButtonType("");
      setButtonLink("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create announcement");
    } finally {
      setLoading(false);
    }
  };
  // get pending students for cohort payment confirmation
  const fetchPendingStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${BASE_URL}/api/payment/pending-confirmation`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const pendingItems =
        (Array.isArray(res.data) && res.data) ||
        res.data?.students ||
        res.data?.payments ||
        res.data?.pendingStudents ||
        res.data?.data ||
        [];
      setPendingStudents(normalizePendingPaymentRows(pendingItems));
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  // fetch all cohorts

  const fetchCohorts = async () => {
    try {
      setLoadingCohorts(true);

      const res = await axios.get(`${BASE_URL}/api/cohort`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCohorts(res.data?.cohorts || res.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch cohorts", err);
      setCohorts([]);
    } finally {
      setLoadingCohorts(false);
    }
  };
  useEffect(() => {
    if (activeTab === "all-cohorts" || activeTab === "create-cohort") {
      fetchCohorts();
    }
  }, [activeTab]);

  // ---------------------------------------------------
  //ADMIN CONFIRM Cohort PAYMENT
  // ---------------------------------------------------
  const confirmPayment = async (studentId, registeredCohort) => {
    try {
      const token = localStorage.getItem("token");
      const rc = normalizeCohortRecord(registeredCohort);

      if (!studentId || !rc.cohortId || !rc.courseId) {
        return alert("Student has no valid cohort or course assigned");
      }

      await axios.put(
        `${BASE_URL}/api/payment/users/${studentId}/confirm-payment`,
        {
          cohortId: rc.cohortId,
          courseId: rc.courseId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPendingStudents((prev) =>
        prev.filter(
          (s) =>
            s._id !== studentId ||
            s.registeredCohort?.cohortId !== rc.cohortId ||
            s.registeredCohort?.courseId !== rc.courseId
        )
      );
      alert("Payment confirmed!");
    } catch (err) {
      console.error("Confirm error:", err);
      alert(err.response?.data?.message || "Error confirming payment");
    }
  };

  // REJECT Cohort PAYMENT
  const rejectPayment = async (studentId, rc) => {
    const reason = prompt("Reason for rejecting payment?");
    if (!reason) return;

    try {
      const token = localStorage.getItem("token");
      const registeredCohort = normalizeCohortRecord(rc);

      if (!studentId || !registeredCohort.cohortId || !registeredCohort.courseId) {
        return alert("Student has no valid cohort or course assigned");
      }

      await axios.put(
        `${BASE_URL}/api/payment/users/${studentId}/reject-payment`,
        {
          cohortId: registeredCohort.cohortId,
          courseId: registeredCohort.courseId,
          reason,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Payment rejected");
      fetchPendingStudents();
    } catch (err) {
      alert(err.response?.data?.message || "Error rejecting payment");
    }
  };

  // ---------------------------------------------------
  // USEEFFECT — RUN FETCH WHEN TAB IS ACTIVE
  // ---------------------------------------------------
  useEffect(() => {
    if (activeTab === "confirm-payment") {
      fetchPendingStudents();
    }
  }, [activeTab]);

  // ---------------------------------------------------
  // SEARCH FILTERING
  // ---------------------------------------------------
  const filteredStudents = pendingStudents.filter((student) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    return (
      student.fullName?.toLowerCase().includes(q) ||
      student.email?.toLowerCase().includes(q) ||
      student.phoneNumber?.includes(q) ||
      student.registeredCohort?.courseName?.toLowerCase().includes(q)
    );
  });

  // ---------------------------------------------------
  // PAGINATION
  // ---------------------------------------------------
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  // 📤 Create Cohort
  const handleCreateCohort = async () => {
    if (!cohortName.trim()) return alert("Cohort name is required");
    if (!selectedCourses.length)
      return alert("Please select at least one course");

    setCreatingCohort(true);

    try {
      // Prepare correct payload for backend
      const validCourses = selectedCourses.map((courseId) => {
        const course = courses.find((c) => c._id === courseId);
        return {
          courseId,
          coachId: course?.coach,
        };
      });

      const payload = {
        name: cohortName.trim(),
        courses: validCourses,
      };

      const res = await axios.post(`${BASE_URL}/api/cohort`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res);
      setMessage(res.data.message || "Cohort created successfully!");
      setCohortName("");
      setSelectedCourses([]);

      // reload cohorts
      const updatedCohorts = await axios.get(`${BASE_URL}/api/cohort`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCohorts(updatedCohorts.data);
    } catch (err) {
      console.error("❌ Failed to create cohort:", err);
      setMessage(err.response?.data?.message || "Failed to create cohort");
    } finally {
      setCreatingCohort(false);
    }
  };

  // 📤 Start Cohort
  const handleStartCohort = async (cohortCourseId) => {
    if (!window.confirm("Start this course in the cohort?")) return;

    try {
      const res = await axios.put(
        `${BASE_URL}/api/cohort/start/course/${cohortCourseId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedCourse = res.data.course;
      console.log(updatedCourse);

      setCohorts((prev) =>
        prev.map((cohort) => ({
          ...cohort,
          courses: cohort.courses.map((c) =>
            c._id.toString() === String(cohortCourseId)
              ? {
                  ...c,
                  status: updatedCourse.status,
                  startDate: updatedCourse.startDate,
                }
              : c
          ),
        }))
      );

      alert("Cohort course started successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to start cohort");
    }
  };

  const handleEndCohort = async (cohortCourseId) => {
    if (!window.confirm("Are you sure you want to END this course?")) return;

    try {
      const res = await axios.put(
        `${BASE_URL}/api/cohort/end/course/${cohortCourseId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update UI
      const updatedCourse = res.data.course;

      setCohorts((prev) =>
        prev.map((cohort) => ({
          ...cohort,
          courses: cohort.courses.map((c) =>
            c._id.toString() === cohortCourseId.toString()
              ? { ...c, ...updatedCourse }
              : c
          ),
        }))
      );

      alert("Course ended successfully!");
      setMessage(res.data.message);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to end course");
    }
  };

  // Undo End Cohort

  const undoStartCohort = async (courseId) => {
    if (!window.confirm("Undo course start?")) return;

    try {
      const res = await axios.patch(
        `${BASE_URL}/api/cohort/course/${courseId}/undo-start`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(res.data.message || "Course start undone successfully");
      fetchCohorts();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to undo course start");
    }
  };
  // Undo End Cohort
  const undoEndCohort = async (courseId) => {
    if (!window.confirm("Undo course completion?")) return;

    try {
      const res = await axios.patch(
        `${BASE_URL}/api/cohort/course/${courseId}/undo-end`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(res.data.message || "Course completion undone successfully");
      fetchCohorts();
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || "Failed to undo course completion"
      );
    }
  };

  const deleteCohort = async (cohortId) => {
    if (!window.confirm("Are you sure you want to delete this cohort?")) return;

    try {
      const res = await axios.delete(`${BASE_URL}/api/cohort/${cohortId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(res.data.message);

      // Reload cohort list
      const updatedCohorts = await axios.get(`${BASE_URL}/api/cohort`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCohorts(updatedCohorts.data);
    } catch (err) {
      console.error("❌ Failed to delete cohort:", err);
      setMessage(err.response?.data?.message || "Failed to delete cohort");
    }
  };
  // 📥 Fetch Analytics
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
    {
      text: "Create Self Learning Course",
      icon: <ManageAccounts />,
      key: "create-self-learning-course",
    },
    {
      text: "Create Free Learning Course",
      icon: <ManageAccounts />,
      key: "create-free-learning-course",
    },

    { text: "All Cohorts", icon: <School />, key: "all-cohorts" },
    { text: "All Courses", icon: <School />, key: "courses" },

    { text: "Manage Videos", icon: <VideoLibrary />, key: "videos" },
    { text: "Students", icon: <People />, key: "students" },
    { text: "Coaches", icon: <School />, key: "coaches" },
    { text: "Create Cohort", icon: <School />, key: "create-cohort" },
    {
      text: "Confirm Cohort Payment",
      icon: <School />,
      key: "confirm-payment",
    },
    {
      text: "Confirm Self-Learning Payment",
      icon: <School />,
      key: "confirm-self-learning-payment",
    },

    {
      text: "Create Announcement",
      icon: <Announcement />,
      key: "create-announcement",
    },
    { text: "Owner Tools", icon: <ManageAccounts />, key: "owner" },
  ];

  // total students taught
  const studentsTaughtCount = Array.isArray(student) ? student.length : 0;

  // chart data
  const chartData = analytics.studentRegistrations.map((item, idx) => ({
    month: item.month,
    students: item.count,
    assignments: analytics.assignmentSubmissions[idx]?.count || 0,
    coaching: analytics.coachingSessions[idx]?.count || 0,

    studentsTaught: studentsTaughtCount,
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
  // Fetch courses for the selected cohort
  useEffect(() => {
    if (activeTab !== "courses" && activeTab !== "create-cohort") return;
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
  // useEffect(() => {
  //   if (!selectedCoach) return;
  //   const fetchPerformance = async () => {
  //     try {
  //       setLoading(true);
  //       const res = await axios.get(
  //         `${BASE_URL}/api/analytics/coach?coachId=${selectedCoach}`,
  //         { headers: { Authorization: `Bearer ${token}` } }
  //       );

  //       console.log("✅ Coach performance:", res.data);

  //       setCoachPerformance(res.data);
  //     } catch (error) {
  //       console.error("❌ Error fetching coach performance:", error);

  //       setCoachPerformance([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchPerformance();
  // }, [selectedCoach, BASE_URL, token]);
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

        const studentsTaughtCount = Array.isArray(student) ? student.length : 0;

        const enhancedPerformance = res.data.map((item) => ({
          ...item,
          studentsTaught: studentsTaughtCount,
        }));

        setCoachPerformance(enhancedPerformance);
      } catch (error) {
        console.error("❌ Error fetching coach performance:", error);
        setCoachPerformance([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [selectedCoach, BASE_URL, token, student]);

  useEffect(() => {
    if (selectedCoach) {
      // fetchPerformance(selectedCoach);
      fetchCoachComments(selectedCoach);
    }
  }, [selectedCoach]);

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
                  {(Array.isArray(coachesList) ? coachesList : []).map(
                    (coach) => (
                      <option key={coach._id} value={coach._id}>
                        {coach.fullName}
                      </option>
                    )
                  )}
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
                        {/* <Bar
                          dataKey="sessions"
                          fill="#3b82f6"
                          name="Sessions"
                        /> */}
                        {/* <Bar
                          dataKey="studentsTaught"
                          fill="#10b981"
                          name="Students Taught"
                        /> */}
                        {/* <Bar
                          dataKey="assignmentsReviewed"
                          fill="#f59e0b"
                          name="Assignments Reviewed"
                        /> */}
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
                {/* 🗨️ STUDENT COMMENTS */}
                {selectedCoach && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      🗨️ Student Feedback
                    </Typography>

                    {loadingComments ? (
                      <CircularProgress />
                    ) : coachComments.length === 0 ? (
                      <Typography color="text.secondary">
                        No comments for this coach yet.
                      </Typography>
                    ) : (
                      <Paper sx={{ p: 2, maxHeight: 300, overflowY: "auto" }}>
                        {coachComments.map((fb) => (
                          <Box
                            key={fb._id}
                            sx={{
                              mb: 2,
                              p: 2,
                              borderRadius: 2,
                              backgroundColor: "#f9fafb",
                            }}
                          >
                            <Typography fontWeight="bold">
                              {fb.student?.fullName || "Student"}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                              Rating: ⭐ {fb.rating}
                            </Typography>

                            {fb.comment && (
                              <Typography sx={{ mt: 1 }}>
                                {fb.comment}
                              </Typography>
                            )}

                            <Typography variant="caption" color="gray">
                              {new Date(fb.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        ))}
                      </Paper>
                    )}
                  </Box>
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
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImageFile(e.target.files[0]);
                  }
                }}
                style={{ marginBottom: "20px" }}
              />

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
                <option value="" disabled>
                  -- Select Duration --
                </option>
                <option value="1-month">1-month</option>
                <option value="3-months">3-months</option>
                <option value="6-months">6-months</option>
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
                    // const res = await axios.post(
                    //   `${BASE_URL}/api/course`,
                    //   {
                    //     name: courseName,
                    //     category: courseCategory,
                    //     description: courseDescription,
                    //     coachId: assignedCoach,
                    //     duration: courseDuration,
                    //   },
                    //   { headers: { Authorization: `Bearer ${token}` } }
                    // );

                    const formData = new FormData();
                    formData.append("name", courseName);
                    formData.append("category", courseCategory);
                    formData.append("description", courseDescription);
                    formData.append("coachId", assignedCoach);
                    formData.append("duration", courseDuration);
                    if (imageFile) formData.append("image", imageFile);

                    const res = await axios.post(
                      `${BASE_URL}/api/course`,
                      formData,
                      {
                        headers: { Authorization: `Bearer ${token}` }, // <-- no Content-Type here
                      }
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
        {/* === Create Self-Learning Course === */}
        {activeTab === "create-self-learning-course" && (
          <Container>
            {/* ===== CREATE COURSE ===== */}
            <Paper sx={{ p: 4, mb: 4 }}>
              <Typography
                variant="h4"
                color="green"
                fontWeight="bold"
                gutterBottom
              >
                📚 Create Self-Learning Course
              </Typography>

              <Box
                component="form"
                onSubmit={handleCreateCourse}
                sx={{ display: "flex", flexDirection: "column", gap: 3 }}
              >
                <TextField
                  label="Course Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                <TextField
                  select
                  SelectProps={{ native: true }}
                  fullWidth
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

                <TextField
                  label="Description"
                  multiline
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />

                {/* 📸 IMAGE UPLOAD */}
                <Button variant="outlined" component="label" color="success">
                  Upload Course Image
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                </Button>

                {image && (
                  <Typography fontSize={13} color="gray">
                    Selected image: {image.name}
                  </Typography>
                )}

                <TextField
                  label="Price (₦)"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  sx={{ width: 220 }}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Course"}
                </Button>

                {message && <Alert severity="info">{message}</Alert>}
              </Box>
            </Paper>

            {/* ===== EXISTING COURSES ===== */}
            <Paper sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                📋 Existing Self-Learning Courses
              </Typography>

              {loading ? (
                <CircularProgress />
              ) : selfLearningCourses.length === 0 ? (
                <Typography color="gray">No courses created yet.</Typography>
              ) : (
                selfLearningCourses.map((course) => {
                  console.log("🖼 Course image URL:", course.image);

                  return (
                    <Paper
                      key={course._id}
                      sx={{
                        p: 2,
                        mb: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                        border: "1px solid #d1fae5",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", gap: 2, alignItems: "center" }}
                      >
                        {/* 🖼 COURSE IMAGE */}
                        {course.image && (
                          <img
                            src={course.image}
                            alt={course.title}
                            style={{
                              width: 120,
                              height: 80,
                              objectFit: "cover",
                              borderRadius: 6,
                            }}
                          />
                        )}

                        <Box>
                          <Typography fontWeight="bold">
                            {course.title}
                          </Typography>
                          <Typography>{course.description}</Typography>
                          <Typography fontWeight="bold">
                            ₦{course.price}
                          </Typography>

                          {course.coachId?.fullName && (
                            <Typography sx={{ fontSize: 13, color: "gray" }}>
                              Coach: {course.coachId.fullName}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      <IconButton
                        color="error"
                        onClick={() =>
                          handleDeleteSelfLearningCourse(course._id)
                        }
                      >
                        <Delete />
                      </IconButton>
                    </Paper>
                  );
                })
              )}
            </Paper>
          </Container>
        )}

        {/* create free learning class */}
        <Container
          sx={{
            display:
              activeTab === "create-free-learning-course" ? "block" : "none",
          }}
        >
          {/* ===== CREATE FREE COURSE ===== */}
          <Paper sx={{ p: 4, mb: 4 }}>
            <Typography
              variant="h4"
              color="green"
              fontWeight="bold"
              gutterBottom
            >
              🎁 Create Free Course
            </Typography>

            <Box
              component="form"
              onSubmit={handleCreateFreeCourse}
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              <TextField
                label="Course Title"
                value={freeTitle}
                onChange={(e) => setFreeTitle(e.target.value)}
                required
              />

              {/* ASSIGN COACH */}
              <TextField
                select
                SelectProps={{ native: true }}
                fullWidth
                value={freeCoachId}
                onChange={(e) => setFreeCoachId(e.target.value)}
                required
                helperText="Please select a coach to assign to this course"
              >
                <option value="">-- Assign Coach --</option>
                {safeCoachesList.map((coach) => (
                  <option key={coach._id} value={coach._id}>
                    {coach.fullName} ({coach.email})
                  </option>
                ))}
              </TextField>

              <TextField
                label="Description"
                multiline
                rows={3}
                value={freeDescription}
                onChange={(e) => setFreeDescription(e.target.value)}
                required
              />

              {/* IMAGE UPLOAD */}
              <Button variant="outlined" component="label" color="success">
                Upload Course Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => setFreeImage(e.target.files[0])}
                />
              </Button>

              {freeImage && (
                <Typography fontSize={13} color="gray">
                  Selected image: {freeImage.name}
                </Typography>
              )}

              <Button
                type="submit"
                variant="contained"
                color="success"
                sx={{ width: 220 }}
                disabled={creatingFree}
              >
                {creatingFree ? "Creating..." : "Create Free Course"}
              </Button>
            </Box>
          </Paper>

          {/* ===== EXISTING FREE COURSES ===== */}
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              📋 Existing Free Courses
            </Typography>

            {loadingFreeCourses ? (
              <CircularProgress />
            ) : freeCourses.length === 0 ? (
              <Typography color="gray">No free courses created yet.</Typography>
            ) : (
              freeCourses.map((course) => (
                <Paper
                  key={course._id}
                  sx={{
                    p: 2,
                    mb: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid #d1fae5",
                  }}
                >
                  <Box>
                    <Typography fontWeight="bold">{course.title}</Typography>
                    <Typography>{course.description}</Typography>

                    {course.coachId?.fullName && (
                      <Typography sx={{ fontSize: 13, color: "gray" }}>
                        Coach: {course.coachId.fullName}
                      </Typography>
                    )}
                  </Box>

                  {course.image && (
                    <img
                      src={course.image}
                      alt={course.title}
                      style={{
                        width: 80,
                        height: 50,
                        objectFit: "cover",
                        borderRadius: 6,
                        marginRight: 12,
                      }}
                    />
                  )}

                  <IconButton
                    color="error"
                    onClick={() => handleDeleteFreeCourse(course._id)}
                  >
                    <Delete />
                  </IconButton>
                </Paper>
              ))
            )}
          </Paper>
        </Container>

        {/* === All Cohorts === */}
        {activeTab === "all-cohorts" && (
          <Container>
            <Paper sx={{ p: 4, borderRadius: 4 }}>
              <Typography
                variant="h4"
                color="green"
                fontWeight="bold"
                gutterBottom
              >
                🎓 All Cohorts
              </Typography>

              {loadingCohorts ? (
                <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : cohorts.length === 0 ? (
                <Typography sx={{ textAlign: "center", color: "gray" }}>
                  No cohorts available.
                </Typography>
              ) : (
                <>
                  {/* Filter / Search Bar */}
                  <Box
                    sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}
                  >
                    <TextField
                      label="Search Cohort"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      sx={{ flex: 1, minWidth: 200 }}
                    />
                  </Box>

                  {/* Cohorts Table */}
                  <div style={{ height: 500, width: "100%" }}>
                    <DataGrid
                      rows={cohorts
                        .filter((c) =>
                          c.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                        )
                        .map((c, idx) => ({
                          id: idx,
                          name: c.name,
                          courses: c.courses
                            .map((co) => co.courseId?.name)
                            .join(", "),
                          startDate: c.startDate || "N/A",
                          endDate: c.endDate || "N/A",
                          totalStudents: c.studentIds?.length || 0,
                        }))}
                      columns={[
                        {
                          field: "name",
                          headerName: "Cohort Name",
                          width: 250,
                        },
                        { field: "courses", headerName: "Courses", width: 300 },
                        {
                          field: "startDate",
                          headerName: "Start Date",
                          width: 150,
                        },
                        {
                          field: "endDate",
                          headerName: "End Date",
                          width: 150,
                        },
                        {
                          field: "totalStudents",
                          headerName: "Total Students",
                          width: 150,
                        },
                      ]}
                      pageSize={5}
                      rowsPerPageOptions={[5, 10, 20]}
                      pagination
                      autoHeight
                      sx={{
                        "& .MuiDataGrid-columnHeaders": {
                          backgroundColor: "#d1fae5",
                          fontWeight: "bold",
                        },
                        "& .MuiDataGrid-cell": {
                          fontSize: 14,
                        },
                      }}
                    />
                  </div>
                </>
              )}
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

            {/* 🔍 Search Input */}
            <Box sx={{ mb: 2, maxWidth: 400 }}>
              <TextField
                fullWidth
                size="small"
                label="Search by name, email or phone"
                placeholder="e.g mutiu, benedicta@gmail.com, 080..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Box>

            {/* 📊 Students Table */}
            <div style={{ height: 500, width: "100%" }}>
              <DataGrid
                rows={filteredStudent.map((s) => ({
                  id: s._id,
                  ...s,
                }))}
                columns={commonColumns}
                pageSize={5}
                rowsPerPageOptions={[5, 10, 20]}
                disableRowSelectionOnClick
              />
            </div>
          </Paper>
        )}
        {/* {activeTab === "students" && (
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
        )} */}
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
        {/* === Create Cohort === */}
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
                  onChange={(e) => {
                    let value = e.target.value.filter((v) => v !== "ALL");
                    setSelectedCourses(value);
                  }}
                  input={<OutlinedInput label="Select Courses" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((id) => {
                        const course = courses.find((c) => c._id === id);
                        return (
                          <Chip
                            key={id}
                            label={course?.name || "Unknown"}
                            onDelete={() =>
                              setSelectedCourses((prev) =>
                                prev.filter((cId) => cId !== id)
                              )
                            }
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  <MenuItem
                    value="ALL"
                    onClick={() =>
                      setSelectedCourses(courses.map((c) => c._id))
                    }
                  >
                    <em>Select All Courses</em>
                  </MenuItem>

                  {courses.map((course) => (
                    <MenuItem key={course._id} value={course._id}>
                      {course.name} ({course.duration})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

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

              {cohorts.map((cohort) => (
                <Card
                  key={cohort._id}
                  sx={{ p: 2, mb: 2, position: "relative" }}
                >
                  <IconButton
                    onClick={() => deleteCohort(cohort._id)}
                    sx={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      color: "red",
                    }}
                  >
                    <Delete />
                  </IconButton>

                  <Typography fontWeight="bold">{cohort.name}</Typography>
                  <Typography sx={{ mt: 1 }}>Courses:</Typography>

                  {Array.isArray(cohort.courses) &&
                  cohort.courses.length > 0 ? (
                    cohort.courses.map((c) => (
                      <Box
                        key={c._id}
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" }, // ✅ mobile fix
                          alignItems: { sm: "center" },
                          justifyContent: "space-between",
                          ml: 2,
                          mt: 2,
                          gap: 2,
                        }}
                      >
                        <Typography>
                          {c.courseId?.name || "Unknown Course"} (
                          {c.courseId?.duration || "N/A"})
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" }, // ✅ stack on mobile
                            gap: 1,
                            width: { xs: "100%", sm: "auto" },
                          }}
                        >
                          {/* START */}
                          <Button
                            fullWidth
                            variant="contained"
                            color="success"
                            disabled={
                              c.status === "in_progress" ||
                              c.status === "completed"
                            }
                            onClick={() => handleStartCohort(c._id)}
                          >
                            Start
                          </Button>

                          {/* END */}
                          <Button
                            fullWidth
                            variant="contained"
                            color="error"
                            disabled={c.status !== "in_progress"}
                            onClick={() => handleEndCohort(c._id)}
                          >
                            End
                          </Button>

                          {/* UNDO START (OWNER) */}
                          {user.role === "owner" &&
                            c.status === "in_progress" && (
                              <Button
                                fullWidth
                                variant="outlined"
                                color="warning"
                                onClick={() => undoStartCohort(c._id)}
                              >
                                Undo Start
                              </Button>
                            )}

                          {/* UNDO END (OWNER) */}
                          {user.role === "owner" &&
                            c.status === "completed" && (
                              <Button
                                fullWidth
                                variant="outlined"
                                color="warning"
                                onClick={() => undoEndCohort(c._id)}
                              >
                                Undo End
                              </Button>
                            )}
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Typography sx={{ ml: 2, color: "gray" }}>
                      No courses in this cohort
                    </Typography>
                  )}
                </Card>
              ))}
            </Paper>
          </Container>
        )}

        {/* CONFIRM COHORT PAYMENT */}
        {activeTab === "confirm-payment" && (
          <Container>
            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Confirm Student Payments
              </Typography>

              {/* SEARCH */}
              <TextField
                label="Search student..."
                fullWidth
                size="small"
                sx={{ mb: 2 }}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />

              {loading ? (
                <Typography>Loading...</Typography>
              ) : currentStudents.length === 0 ? (
                <Typography color="text.secondary">
                  No students found.
                </Typography>
              ) : (
                <>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Phone</TableCell>
                          <TableCell>Course</TableCell>
                          <TableCell>Registered At</TableCell>
                          <TableCell>Proof</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {currentStudents.map((student) => {
                          const rc = student.registeredCohort || {};
                          const pending = !student.paymentConfirmed;

                          return (
                            <TableRow key={`${student._id}-${rc.courseId}`}>
                              {/* <TableRow key={student._id}> */}
                              <TableCell>{student.fullName}</TableCell>
                              <TableCell>{student.email}</TableCell>
                              <TableCell>{student.phoneNumber}</TableCell>
                              <TableCell>{rc.courseName || "-"}</TableCell>
                              <TableCell>
                                {rc.registeredAt
                                  ? new Date(
                                      rc.registeredAt
                                    ).toLocaleDateString()
                                  : "-"}
                              </TableCell>

                              {/* 👁 PROOF */}
                              <TableCell>
                                {rc?.proofOfPayment?.url ? (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() =>
                                      window.open(
                                        rc.proofOfPayment.url,
                                        "_blank"
                                      )
                                    }
                                  >
                                    View Proof
                                  </Button>
                                ) : (
                                  "-"
                                )}
                              </TableCell>

                              {/* STATUS */}
                              <TableCell>
                                <Chip
                                  label={
                                    student.paymentConfirmed
                                      ? "Paid"
                                      : "Pending"
                                  }
                                  color={
                                    student.paymentConfirmed
                                      ? "success"
                                      : "warning"
                                  }
                                  variant="outlined"
                                />
                              </TableCell>

                              {/* ACTIONS */}
                              <TableCell>
                                {pending && (
                                  <Stack direction="row" spacing={1}>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="success"
                                      onClick={() =>
                                        confirmPayment(student._id, rc)
                                      }
                                    >
                                      Confirm
                                    </Button>

                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      onClick={() =>
                                        rejectPayment(student._id, rc)
                                      }
                                    >
                                      Reject
                                    </Button>
                                  </Stack>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* PAGINATION */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mt: 2,
                      gap: 2,
                    }}
                  >
                    <Button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Prev
                    </Button>

                    <Typography>
                      Page {currentPage} of {totalPages}
                    </Typography>

                    <Button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </Box>
                </>
              )}

              {error && (
                <Typography color="error" mt={2}>
                  {error}
                </Typography>
              )}
            </Paper>
          </Container>
        )}

        {/*CONFIRM SELF LEARNING COURSES PAYMENT */}
        {activeTab === "confirm-self-learning-payment" && (
          <Container>
            <Paper sx={{ p: 4, borderRadius: 4 }}>
              <Typography
                variant="h4"
                color="green"
                fontWeight="bold"
                gutterBottom
              >
                💳 Confirm Self-Learning Payments
              </Typography>

              {message && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  {message}
                </Alert>
              )}

              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : payments.length === 0 ? (
                <Typography sx={{ textAlign: "center", color: "gray" }}>
                  No pending payment proofs.
                </Typography>
              ) : (
                <Box sx={{ overflowX: "auto" }}>
                  <Table sx={{ minWidth: 900 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Course</TableCell>
                        <TableCell>Proof</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {payments.map((p) => (
                        <TableRow key={p._id}>
                          <TableCell>{p.student.fullName}</TableCell>
                          <TableCell>{p.student.email}</TableCell>
                          <TableCell>
                            {p.course?.title || "Course removed"}
                          </TableCell>

                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              href={p.proofUrl}
                              target="_blank"
                            >
                              View Proof
                            </Button>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={p.status}
                              color={
                                p.status === "approved"
                                  ? "success"
                                  : p.status === "rejected"
                                  ? "error"
                                  : "warning"
                              }
                            />
                          </TableCell>

                          <TableCell align="center">
                            {p.status === "pending" && (
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Button
                                  variant="contained"
                                  color="success"
                                  disabled={actionLoading}
                                  onClick={() =>
                                    handleAction(
                                      p.student._id,
                                      p.course._id,
                                      "approve"
                                    )
                                  }
                                >
                                  Approve
                                </Button>

                                <Button
                                  variant="contained"
                                  color="error"
                                  disabled={actionLoading}
                                  onClick={() =>
                                    handleAction(
                                      p.student._id,
                                      p.course._id,
                                      "reject"
                                    )
                                  }
                                >
                                  Reject
                                </Button>
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Paper>
          </Container>
        )}

        {/* {/* === Create Announcement === */}
        {activeTab === "create-announcement" && (
          <Container>
            <Paper sx={{ p: 4, borderRadius: 4, mb: 4 }}>
              <Typography
                variant="h4"
                color="green"
                fontWeight="bold"
                gutterBottom
              >
                📢 Create Announcement
              </Typography>

              {/* Form */}
              <Box
                component="form"
                sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                onSubmit={handleSubmit}
              >
                {/* Title */}
                <TextField
                  label="Announcement Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                {/* Message */}
                <TextField
                  label="Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  multiline
                  rows={4}
                />

                {/* Select Button Type */}
                <TextField
                  select
                  label="Button Type (Optional)"
                  value={buttonType}
                  onChange={(e) => setButtonType(e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="whatsapp">WhatsApp</MenuItem>
                  <MenuItem value="telegram">Telegram</MenuItem>
                  <MenuItem value="youtube">YouTube</MenuItem>
                </TextField>
                {/* Link Input (conditional) */}
                {buttonType && (
                  <TextField
                    label="Button Link"
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    required
                  />
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  sx={{ width: "200px", alignSelf: "flex-start" }}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Announcement"}
                </Button>

                {/* Feedback */}
                {success && <Alert severity="success">{success}</Alert>}
                {error && <Alert severity="error">{error}</Alert>}
              </Box>
            </Paper>

            {/* Existing Announcements */}
            <Paper sx={{ p: 4, borderRadius: 4 }}>
              <Typography
                variant="h5"
                color="green"
                fontWeight="bold"
                gutterBottom
              >
                📰 Existing Announcements
              </Typography>

              {loadingAnnouncements ? (
                <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : announcements.length === 0 ? (
                <Typography sx={{ textAlign: "center", color: "gray" }}>
                  No announcements yet.
                </Typography>
              ) : (
                announcements.map((a) => (
                  <Box
                    key={a._id}
                    sx={{
                      mb: 3,
                      p: 2,
                      border: "1px solid #d1fae5",
                      borderRadius: 2,
                      position: "relative",
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {a.title}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {a.message}
                    </Typography>
                    {a.button && (
                      <Button
                        variant="contained"
                        size="small"
                        href={
                          a.button === "whatsapp"
                            ? a.whatsappLink
                            : a.button === "telegram"
                            ? a.telegramLink
                            : a.youtubeLink
                        }
                        target="_blank"
                      >
                        {a.button.charAt(0).toUpperCase() + a.button.slice(1)}
                      </Button>
                    )}
                    {/* Delete Icon */}
                    <Button
                      variant="text"
                      color="error"
                      sx={{ position: "absolute", top: 8, right: 8 }}
                      onClick={() => handleDelete(a._id)}
                    >
                      Delete
                    </Button>
                  </Box>
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
