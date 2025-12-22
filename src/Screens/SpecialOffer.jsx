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
  Card,
  Paper,
} from "@mui/material";
import {
  Menu as MenuIcon,
  AccountCircle as AccountCircleIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  EmojiEvents as TrophyIcon,
  LinkedIn as LinkedInIcon,
  AutoAwesome as SparklesIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logo.jpeg";

// Design Constants
const PRIMARY_GREEN_DARK = "#006400";
const ACCENT_GREEN_LIGHT = "#6aa84f";
const BORDER_ACCENT = "#d9ead3";
const BUTTON_GREEN = "#14CD02";

// --- Sub-Component: Navbar (Same as your previous design) ---
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

const SpecialOffer = () => {
  const [userName, setUserName] = useState("");
  const [userPhoto, setUserPhoto] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "");
    setUserPhoto(localStorage.getItem("userPhoto") || "");
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleDashboardClick = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const role = user.role || "student";
    navigate(
      role === "owner"
        ? "/owner"
        : role === "coach"
        ? "/coach"
        : "/student/dashboard"
    );
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

      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        {/* Animated Title */}
        <Box textAlign="center" mb={6}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h3"
              fontWeight="900"
              sx={{ color: PRIMARY_GREEN_DARK, letterSpacing: -1, mb: 1 }}
            >
              SPECIAL OFFER{" "}
              <SparklesIcon
                sx={{
                  verticalAlign: "middle",
                  fontSize: 40,
                  color: ACCENT_GREEN_LIGHT,
                }}
              />
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Exclusively for our Batch 12 High Achievers
            </Typography>
          </motion.div>
        </Box>

        {/* The Main Offer Card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          <Card
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              textAlign: "center",
              position: "relative",
              overflow: "visible",
              border: `2px solid ${ACCENT_GREEN_LIGHT}`,
              background: "linear-gradient(145deg, #ffffff 0%, #f9fff9 100%)",
            }}
          >
            {/* Floating Trophy Icon */}
            <Box
              sx={{
                position: "absolute",
                top: -40,
                left: "50%",
                transform: "translateX(-50%)",
                bgcolor: BUTTON_GREEN,
                color: "white",
                p: 2,
                borderRadius: "50%",
                boxShadow: "0 10px 20px rgba(20, 205, 2, 0.4)",
              }}
            >
              <TrophyIcon sx={{ fontSize: 50 }} />
            </Box>

            <Typography
              variant="h4"
              fontWeight="800"
              sx={{ color: PRIMARY_GREEN_DARK, mt: 4, mb: 3, lineHeight: 1.2 }}
            >
              The Overall Best Graduating Student of the 12th Batch
            </Typography>

            <Divider
              sx={{ mb: 4, width: "60%", mx: "auto", bgcolor: BORDER_ACCENT }}
            />

            <Typography
              variant="h5"
              sx={{
                color: "text.primary",
                fontWeight: 500,
                px: { md: 4 },
                lineHeight: 1.6,
              }}
            >
              Will receive a{" "}
              <span style={{ color: BUTTON_GREEN, fontWeight: "bold" }}>
                100% FREE LinkedIn Profile Revamp Design
              </span>{" "}
              from one of the industry's top LinkedIn designers!
            </Typography>

            <Box
              sx={{
                mt: 5,
                display: "flex",
                justifyContent: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 1.5,
                  px: 3,
                  borderRadius: "12px",
                  bgcolor: "#e8f4fd",
                  color: "#0077b5",
                }}
              >
                <LinkedInIcon />
                <Typography fontWeight="bold">Professional Branding</Typography>
              </Paper>
              <Paper
                elevation={0}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 1.5,
                  px: 3,
                  borderRadius: "12px",
                  bgcolor: "#fef9c3",
                  color: "#854d0e",
                }}
              >
                <SparklesIcon />
                <Typography fontWeight="bold">Top Designer Access</Typography>
              </Paper>
            </Box>

            <Button
              variant="contained"
              onClick={() => navigate("/contact")}
              sx={{
                mt: 6,
                bgcolor: BUTTON_GREEN,
                color: "white",
                px: 6,
                py: 2,
                borderRadius: "50px",
                fontSize: "1.1rem",
                fontWeight: "bold",
                textTransform: "none",
                boxShadow: "0 8px 15px rgba(20, 205, 2, 0.3)",
                "&:hover": {
                  bgcolor: "#11b502",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Ask Questions About Batch 12
            </Button>
          </Card>
        </motion.div>

        {/* Footer Note */}
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          mt={4}
        >
          *Selection is based on overall performance, project submissions, and
          participation.
        </Typography>
      </Container>
    </Box>
  );
};

export default SpecialOffer;
