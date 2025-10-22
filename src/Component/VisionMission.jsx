import React from "react";
import { Box, Grid, Paper, Typography, Container } from "@mui/material";

const VisionMission = () => (
  <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: "#f9fafb" }}>
    <Container maxWidth="lg">
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, height: "100%" }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, mb: 2, color: "#065f46" }}
            >
              Our Vision
            </Typography>
            <Typography variant="body1" sx={{ color: "#333" }}>
              To empower individuals with practical digital skills for the
              future of work, fostering innovation and global competitiveness.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, height: "100%" }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, mb: 2, color: "#065f46" }}
            >
              Our Mission
            </Typography>
            <Typography variant="body1" sx={{ color: "#333" }}>
              To deliver accessible, high-quality digital education and
              mentorship, equipping learners with the tools to succeed in a
              tech-driven world.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  </Box>
);

export default VisionMission;
