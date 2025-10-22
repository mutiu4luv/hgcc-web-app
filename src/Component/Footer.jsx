import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";

const Footer = () => (
  <Box sx={{ bgcolor: "#132F4C", color: "#fff", py: 4, mt: 8 }}>
    <Container maxWidth="lg">
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            HGSC² Digital Skill Academy
          </Typography>
          <Typography variant="body2" sx={{ color: "#e0e0e0" }}>
            Empowering you with practical digital skills for the future of work.
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Quick Links
          </Typography>
          <Box>
            <Link
              href="#"
              color="inherit"
              underline="hover"
              sx={{ display: "block", mb: 0.5 }}
            >
              Home
            </Link>
            <Link
              href="#"
              color="inherit"
              underline="hover"
              sx={{ display: "block", mb: 0.5 }}
            >
              Courses
            </Link>
            <Link
              href="#"
              color="inherit"
              underline="hover"
              sx={{ display: "block", mb: 0.5 }}
            >
              Contact
            </Link>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Connect with us
          </Typography>
          <Box>
            <IconButton color="inherit" href="#">
              <FacebookIcon />
            </IconButton>
            <IconButton color="inherit" href="#">
              <TwitterIcon />
            </IconButton>
            <IconButton color="inherit" href="#">
              <InstagramIcon />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
      <Box sx={{ textAlign: "center", mt: 4, color: "#bdbdbd" }}>
        <Typography variant="caption">
          © {new Date().getFullYear()} HGSC² Digital Skill Academy. All rights
          reserved.
        </Typography>
      </Box>
    </Container>
  </Box>
);

export default Footer;
