import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Avatar,
  Divider,
  ListItemIcon,
  Grid,
  Card,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  Menu as MenuIcon,
  AccountCircle as AccountCircleIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  School,
  WorkspacePremium,
  TrendingUp,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logo.jpeg";

// Design Constants
const PRIMARY_GREEN_DARK = "#006400";
const ACCENT_GREEN_LIGHT = "#6aa84f";
const BORDER_ACCENT = "#d9ead3";
const BUTTON_GREEN = "#14CD02";

// Course data
const courses = [
  {
    icon: School,
    title: "1 Month Course",
    description: [
      "Copy Writing",
      "Video Editing",
      "Ghost Writing",
      "Fashion Design",
      "Graphics Design",
      "SEO Writing",
      "Community Management",
      "Digital Marketing",
      "Content Strategy",
      "Ad Management",
    ],
  },
  {
    icon: WorkspacePremium,
    title: "3 Months Course",
    description: [
      "Data Analytics",
      "UI/UX Design",
      "Product Management",
      "Project Management",
    ],
  },
  {
    icon: TrendingUp,
    title: "6 Months Course",
    description: ["Full Stack Development", "AI Programming", "Cyber Security"],
  },
  {
    icon: School,
    title: " Our Offers",
    description: [
      "🔥 Free professional portfolio creation after graduation",
      "🔥 Free outstanding CV design",
      "🔥 Free LinkedIn profile optimization",
      "🔥 Free daily job referral links",
      "🔥 Free Interview Tips Masterclass",
    ],
  },
];

// --- Sub-Component: Navbar ---
const Navbar = ({
  userName,
  userPhoto,
  handleLogout,
  navigate,
  handleDashboardClick,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const menuItems = [
    { label: "Home", path: "/" },
    { label: "Offers", path: "/offers" },
    { label: "Special Offer", path: "/special" },
    { label: "Awards", path: "/awards" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ bgcolor: "white", borderBottom: `1px solid ${BORDER_ACCENT}` }}
    ></AppBar>
  );
};

// --- Sub-Component: CourseCard ---
const CourseCard = ({ icon: Icon, title, description, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: index * 0.2 }}
    whileHover={{ scale: 1.03 }}
    style={{ height: "100%" }}
  >
    <Card
      sx={{
        p: 3,
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        borderTop: `8px solid ${ACCENT_GREEN_LIGHT}`,
        bgcolor: "#fff",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: { xs: "280px", sm: "300px" },
      }}
    >
      <Avatar sx={{ bgcolor: BORDER_ACCENT, width: 64, height: 64, mb: 2 }}>
        <Icon sx={{ fontSize: 40, color: PRIMARY_GREEN_DARK }} />
      </Avatar>

      <Typography
        variant="h6"
        fontWeight="bold"
        mb={2}
        textAlign="center"
        sx={{ color: PRIMARY_GREEN_DARK }}
      >
        {title}
      </Typography>

      {/* Scrollable Description List */}
      <Box
        sx={{
          width: "100%",
          flexGrow: 1,
          maxHeight: "220px",
          overflowY: "auto",
          mb: 2,
          pr: 1,
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: ACCENT_GREEN_LIGHT,
            borderRadius: "10px",
          },
        }}
      >
        <List dense>
          {description.map((item, i) => (
            <ListItem key={i} sx={{ py: 0.2 }}>
              <ListItemText
                primary={`• ${item}`}
                primaryTypographyProps={{
                  fontSize: "0.9rem",
                  color: "text.secondary",
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* <Button
        variant="contained"
        sx={{
          mt: "auto",
          bgcolor: BUTTON_GREEN,
          borderRadius: "30px",
          px: 4,
          py: 1,
          fontWeight: "bold",
          textTransform: "none",
          "&:hover": { bgcolor: "#0ea800" },
        }}
      >
        Learn More
      </Button> */}
    </Card>
  </motion.div>
);

// --- Main Page Component ---
const OffersPage = () => {
  const [userName, setUserName] = useState("");
  const [userPhoto, setUserPhoto] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedPhoto = localStorage.getItem("userPhoto");
    if (storedName) setUserName(storedName);
    if (storedPhoto) setUserPhoto(storedPhoto);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUserName("");
    setUserPhoto("");
    navigate("/");
  };

  const handleDashboardClick = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const role = user.role || "student";
    if (role === "owner") navigate("/owner");
    else if (role === "coach") navigate("/coach");
    else navigate("/student/dashboard");
  };

  return (
    <Box sx={{ bgcolor: BORDER_ACCENT, minHeight: "100vh" }}>
      <Navbar
        userName={userName}
        userPhoto={userPhoto}
        handleLogout={handleLogout}
        navigate={navigate}
        handleDashboardClick={handleDashboardClick}
      />

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Header Section */}
        <Box textAlign="center" mb={8}>
          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{
              color: PRIMARY_GREEN_DARK,
              position: "relative",
              display: "inline-block",
              fontSize: { xs: "2rem", md: "3rem" },
            }}
          >
            COURSES WE OFFER
            <motion.span
              animate={{ width: ["0%", "100%", "0%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                left: 0,
                bottom: -6,
                height: "4px",
                backgroundColor: ACCENT_GREEN_LIGHT,
                borderRadius: "2px",
              }}
            />
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            mt={3}
            sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
          >
            Choose a path that empowers your future in the digital economy.
          </Typography>
        </Box>

        {/* Courses Grid */}
        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="stretch" // This makes all grid items (cards) the same height
        >
          {courses.map((course, index) => (
            <Grid item key={index} sx={{ display: "flex" }}>
              <CourseCard {...course} index={index} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default OffersPage;
