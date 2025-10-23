import React from "react";
import { Box, Typography, Button, Container, Grid, Paper } from "@mui/material";
import { motion } from "framer-motion";
import hero from "../assets/hero.png";

const Hero = () => {
  return (
    <Box
      sx={{
        backgroundImage: `
          url(${hero})`,
        color: "#fff",
        py: { xs: 6, md: 12 },
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Left Section */}
          <Grid item xs={12} md={6}>
            <Box sx={{ maxWidth: 640 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  lineHeight: 1.2,
                }}
              >
                HGSC² Digital Skills Academy
              </Typography>

              <Typography
                variant="h6"
                color="wheat"
                sx={{
                  mb: 3,
                  opacity: 0.9,
                  lineHeight: 1.5,
                }}
              >
                4x award-winning academy • 2,000+ students from 18 countries •
                practical, career-focused tech training
              </Typography>

              {/* Buttons */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  mb: 4,
                }}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                  }}
                >
                  Register Now
                </Button>

                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  href="#courses"
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    borderColor: "rgba(255,255,255,0.7)",
                    "&:hover": {
                      borderColor: "#fff",
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  View Courses
                </Button>
              </Box>

              {/* Stats */}
              <Grid container spacing={2}>
                {[
                  { value: "2000+", label: "Students" },
                  { value: "18", label: "Countries" },
                  { value: "4x", label: "Awards" },
                ].map((stat, index) => (
                  <Grid item key={index}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        textAlign: "center",
                        bgcolor: "rgba(255,255,255,0.08)",
                        borderRadius: 2,
                        minWidth: 80,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "#fff" }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ opacity: 0.9, color: "#fff" }}
                      >
                        {stat.label}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>

          {/* Right Section */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
            >
              <Paper
                elevation={6}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  maxWidth: 400,
                  mx: "auto",
                  bgcolor: "#fff",
                  color: "#065f46",
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      color: "#065f46",
                    }}
                  >
                    Start learning today
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mb: 2,
                      color: "rgba(0,0,0,0.7)",
                    }}
                  >
                    Short courses, live classes, and mentorship to kickstart
                    your tech career.
                  </Typography>

                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Get Started — Free Preview
                  </Button>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Hero;
