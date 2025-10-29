import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom"; // ✅ For navigation
import logo from "../assets/logo.jpeg"; // ✅ ensure correct path

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate(); // ✅ useNavigate hook

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogoClick = () => {
    navigate("/"); // ✅ Navigate to home
  };

  const menuItems = [
    { label: "Home", href: "#home" },
    { label: "Offers", href: "#offers" },
    { label: "Special Offer", href: "#special" },
    { label: "Awards", href: "#awards" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <AppBar
      position="static"
      elevation={0}
      color="transparent"
      sx={{
        background: "transparent",
        mb: 1,
        height: { xs: 60, md: 70 }, // ✅ Reduced height
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
            minHeight: "unset", // ✅ prevent default Toolbar height
          }}
        >
          {/* ✅ Logo Section */}
          <Box
            onClick={handleLogoClick}
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer", // ✅ Indicate clickable logo
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="HGSC² Academy Logo"
              sx={{
                width: { xs: 100, sm: 130, md: 150 }, // ✅ Slightly smaller
                height: "auto",
                objectFit: "contain",
              }}
            />
          </Box>

          {/* Desktop Menu */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
            {menuItems.map((item) => (
              <Button
                key={item.label}
                href={item.href}
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
          </Box>

          {/* Mobile Menu Icon */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              onClick={handleOpenMenu}
            >
              <MenuIcon sx={{ color: "#065f46" }} />
            </IconButton>
          </Box>

          {/* Mobile Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            {menuItems.map((item) => (
              <MenuItem
                key={item.label}
                onClick={handleCloseMenu}
                component="a"
                href={item.href}
                sx={{ color: "#065f46", fontWeight: 500 }}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
