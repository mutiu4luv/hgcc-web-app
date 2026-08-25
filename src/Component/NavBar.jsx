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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpeg";

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [userName, setUserName] = useState("");
  const [userPhoto, setUserPhoto] = useState("");
  const navigate = useNavigate();

  // ✅ Load user info
  useEffect(() => {
    const loadUser = () => {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const storedName =
        storedUser.fullName ||
        storedUser.name ||
        storedUser.username ||
        localStorage.getItem("userName") ||
        "";
      const storedPhoto =
        storedUser.photo ||
        storedUser.profilePhoto ||
        localStorage.getItem("userPhoto") ||
        "";

      setUserName(storedName);
      setUserPhoto(storedPhoto);
    };

    loadUser();
    window.addEventListener("storage", loadUser);
    window.addEventListener("userUpdated", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("userUpdated", loadUser);
    };
  }, []);

  const handleDashboardClick = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const role = user.role || "student";
    const storedSelectedCohortId = localStorage.getItem("selectedCohortId");
    const storedCohorts = JSON.parse(localStorage.getItem("userCohorts") || "[]");
    const fallbackCohortId =
      storedCohorts.find((cohort) => cohort?._id)?._id ||
      user?.cohorts?.find((cohort) => cohort?._id)?._id ||
      "";
    const validStoredCohortId = storedCohorts.some(
      (cohort) => cohort?._id === storedSelectedCohortId
    )
      ? storedSelectedCohortId
      : "";
    const coachDashboardPath =
      validStoredCohortId || fallbackCohortId
        ? `/coach/${validStoredCohortId || fallbackCohortId}`
        : "/coach";

    if (storedSelectedCohortId && !validStoredCohortId) {
      localStorage.removeItem("selectedCohortId");
    }

    if (role === "owner") navigate("/owner");
    else if (role === "coach") navigate(coachDashboardPath);
    else navigate("/student/dashboard");

    handleUserMenuClose();
  };

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleUserMenuOpen = (event) => setUserMenuAnchor(event.currentTarget);
  const handleUserMenuClose = () => setUserMenuAnchor(null);
  const handleLogoClick = () => navigate("/");
  const handleLoginNow = () => navigate("/login");

  const handleLogout = () => {
    localStorage.clear();
    setUserName("");
    setUserPhoto("");
    handleUserMenuClose();
    navigate("/");
  };

  const menuItems = [
    { label: "Home", path: "/" },
    { label: "Offers", path: "/offers" },
    { label: "Special Offer", path: "/special" },
    { label: "Awards", path: "/awards" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <AppBar
      position="static"
      elevation={0}
      color="transparent"
      sx={{
        background: "transparent",
        mb: 1,
        height: { xs: 60, md: 70 },
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* ✅ Logo */}
          <Box
            onClick={handleLogoClick}
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            <Box
              component="img"
              src={logo}
              alt="HGSC² Digital Skills Logo"
              sx={{
                width: { xs: 100, sm: 130, md: 150 },
                height: "auto",
                objectFit: "contain",
              }}
            />
          </Box>

          {/* ✅ Desktop Menu */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 3,
            }}
          >
            {menuItems.map((item) => (
              <Button
                key={item.label}
                onClick={() => navigate(item.path)}
                sx={{
                  color: "#065f46",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1rem",
                }}
              >
                {item.label}
              </Button>
            ))}

            {/* ✅ User avatar + name */}
            {userName ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600, color: "#065f46" }}
                >
                  Hi, {userName.split(" ")[0]}
                </Typography>

                <IconButton onClick={handleUserMenuOpen}>
                  <Avatar
                    src={userPhoto || ""}
                    alt={userName || "User"}
                    sx={{ bgcolor: userPhoto ? "transparent" : "#16a34a" }}
                  >
                    {!userPhoto && <AccountCircleIcon />}
                  </Avatar>
                </IconButton>
              </Box>
            ) : (
              <Button
                variant="contained"
                onClick={handleLoginNow}
                sx={{
                  backgroundColor: "#16a34a",
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: "8px",
                  "&:hover": { backgroundColor: "#15803d" },
                }}
              >
                Login Now
              </Button>
            )}
          </Box>

          {/* ✅ Mobile Menu */}
          <Box
            sx={{ display: { xs: "flex", md: "none" }, alignItems: "center" }}
          >
            {userName ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {/* 👇 User Avatar Replaces Toggle */}
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: "#065f46",
                    maxWidth: 100,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  Hi, {userName.split(" ")[0]}
                </Typography>
                <IconButton onClick={handleUserMenuOpen}>
                  <Avatar
                    src={userPhoto || ""}
                    alt={userName || "User"}
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: userPhoto ? "transparent" : "#16a34a",
                    }}
                  >
                    {!userPhoto && <AccountCircleIcon />}
                  </Avatar>
                </IconButton>
              </Box>
            ) : (
              // 👇 If not logged in, show normal toggle
              <IconButton size="large" edge="end" onClick={handleOpenMenu}>
                <MenuIcon sx={{ color: "#065f46" }} />
              </IconButton>
            )}
          </Box>

          {/* ✅ User Menu (both desktop + mobile) */}
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                borderRadius: 2,
                minWidth: 220,
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            <MenuItem onClick={() => navigate("/profile")}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleDashboardClick}>
              <ListItemIcon>
                <DashboardIcon fontSize="small" />
              </ListItemIcon>
              Dashboard
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: "red" }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>

          {/* ✅ Mobile dropdown (for guests only) */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
          >
            {menuItems.map((item) => (
              <MenuItem
                key={item.label}
                onClick={() => {
                  handleCloseMenu();
                  navigate(item.path);
                }}
                sx={{ color: "#065f46", fontWeight: 500 }}
              >
                {item.label}
              </MenuItem>
            ))}
            {!userName && (
              <MenuItem
                onClick={() => {
                  handleCloseMenu();
                  handleLoginNow();
                }}
                sx={{
                  color: "#fff",
                  fontWeight: 600,
                  backgroundColor: "#16a34a",
                  borderRadius: "6px",
                  mx: 1,
                  mt: 1,
                  "&:hover": { backgroundColor: "#15803d" },
                }}
              >
                Login Now
              </MenuItem>
            )}
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
