import React from "react";
import { Box, Container, Grid, Typography, Link, Divider } from "@mui/material";
import { Email, Phone, LocationOn } from "@mui/icons-material";

const Footer = () => {
  return (
    <Box
      sx={{
        bgcolor: "#17372A", // New dark green background
        color: "white", // White text
        py: 6,
        px: 2,
        mt: 0, // Remove top white space
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* --- Logo and About Section --- */}
          <Grid item xs={12} md={3}>
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ color: "#ffffff", mb: 2 }}
            >
              HGSC²
            </Typography>
            <Typography
              variant="body2"
              sx={{ lineHeight: 1.8 }}
              style={{ color: "#ffffff" }}
            >
              HGSC² Digital Skills Academy is dedicated to empowering
              individuals with affordable, high-quality digital training that
              opens doors to global opportunities.
            </Typography>
          </Grid>

          {/* --- Quick Links --- */}
          <Grid item xs={6} md={2}>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ color: "#ffffff", mb: 2 }}
            >
              Quick Links
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link href="#" underline="hover" color="inherit">
                About Us
              </Link>
              <Link href="#" underline="hover" color="inherit">
                Contact Us
              </Link>
              <Link href="#" underline="hover" color="inherit">
                Courses We Offer
              </Link>
              <Link href="#" underline="hover" color="inherit">
                Special Offer
              </Link>
            </Box>
          </Grid>

          {/* --- Additional Links --- */}
          <Grid item xs={6} md={2}>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ color: "#ffffff", mb: 2 }}
            >
              Explore
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link href="#" underline="hover" color="inherit">
                Awards
              </Link>
              <Link href="#" underline="hover" color="inherit">
                Reviews
              </Link>
            </Box>
          </Grid>

          {/* --- Contact Section --- */}
          <Grid item xs={12} md={5}>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ color: "#ffffff", mb: 2 }}
            >
              Contact Info
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Email sx={{ color: "#ffffff", mr: 1 }} />
              <Typography variant="body2" style={{ color: "#ffffff" }}>
                hgscdigitalskillsacademy@gmail.com
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Phone sx={{ color: "#ffffff", mr: 1 }} />
              <Typography variant="body2" style={{ color: "#ffffff" }}>
                +234 907 165 1329
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "flex-start" }}>
              <LocationOn sx={{ color: "#ffffff", mr: 1, mt: 0.3 }} />
              <Typography variant="body2" style={{ color: "#ffffff" }}>
                Coker, Surulere, Lagos State, Nigeria
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* --- Divider --- */}
        <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.2)" }} />

        {/* --- Footer Bottom --- */}
        <Box
          sx={{
            textAlign: "center",
            fontSize: "0.9rem",
            color: "rgba(255,255,255,0.8)",
          }}
        >
          <Typography variant="body2" style={{ color: "#ffffff" }}>
            © {new Date().getFullYear()} HGSC² Digital Skills Academy. All
            rights reserved.
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 1, fontStyle: "italic", color: "#ffffff" }}
          >
            Designed by{" "}
            <Box component="span" sx={{ color: "#ffffff", fontWeight: "bold" }}>
              Madu Chibueze Emmanuel
            </Box>{" "}
            | Email:{" "}
            <Link
              href="mailto:chidiemmamadu@gmail.com"
              sx={{ color: "#ffffff", ml: 0.5 }}
            >
              chidiemmamadu@gmail.com
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
