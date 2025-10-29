import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { motion } from "framer-motion";
import heroSide from "../assets/heroSide.png";

const Hero = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column-reverse", md: "row" }, // image on top for mobile
        width: "100%",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      {/* LEFT SECTION */}
      <Box
        sx={{
          width: { xs: "100%", md: "50%" },
          backgroundColor: "#17372A",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: { xs: 3, sm: 5, md: 8 },
          py: { xs: 6, md: 0 },
          textAlign: "left", // always left-aligned
          boxSizing: "border-box",
        }}
      >
        {/* ✨ Heading */}
        <Typography
          component={motion.h1}
          variant="h3"
          sx={{
            fontWeight: 800,
            mb: 2,
            lineHeight: 1.2,
            fontSize: { xs: "2rem", md: "3rem" },
            display: "inline-block",
            overflow: "hidden",
            borderRight: ".15em solid #14CD02",
            whiteSpace: "normal",
            wordBreak: "break-word",
            maxWidth: { xs: "100%", md: "90%" },
          }}
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{
            duration: 2.5,
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          HGSC² Digital Skill Academy LTD.
        </Typography>

        {/* 🔹 Bullet Subtitle */}
        <Box
          component={motion.div}
          sx={{
            mb: 3,
            color: "wheat",
            fontSize: { xs: "1rem", md: "1.1rem" },
            display: "flex",
            flexDirection: "column",
            gap: 1,
            alignItems: "flex-start", // ensures bullets align left
            pl: 1, // slight padding for visual alignment
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 2.8 }}
        >
          <Typography variant="body1" color="inherit">
            • 4x Award-Winning Academy
          </Typography>
          <Typography variant="body1" color="inherit">
            • Over 2,000 Certified Students from 18 Countries
          </Typography>
          <Typography variant="body1" color="inherit">
            • Affordable, High-Quality Training in Digital, Tech, and Personal
            Development Skills
          </Typography>
          <Typography variant="body1" color="inherit">
            • Access to Job Referrals and Career Opportunities
          </Typography>
        </Box>

        {/* BUTTONS */}
        <Box
          component={motion.div}
          sx={{
            display: "flex",
            justifyContent: { xs: "flex-start", md: "flex-start" },
            gap: 2,
            flexWrap: "wrap",
            mb: 4,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 3.2 }}
        >
          <Button
            variant="contained"
            size="large"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              backgroundColor: "#14CD02",
              "&:hover": { backgroundColor: "#15803d" },
            }}
          >
            Enroll Now
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
                borderColor: "#FFFFFF",
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Learn More
          </Button>
        </Box>

        {/* STATS */}
        <Box
          component={motion.div}
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: { xs: "flex-start", md: "flex-start" },
            flexWrap: "wrap",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 3.5 }}
        >
          {[
            { value: "2000+", label: "Students" },
            { value: "18", label: "Countries" },
            { value: "4x", label: "Awards" },
          ].map((stat, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 1.5,
                textAlign: "center",
                bgcolor: "#D9D9D9",
                borderRadius: 2,
                minWidth: 80,
              }}
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#000" }}>
                {stat.value}
              </Typography>
              <Typography
                variant="caption"
                sx={{ opacity: 0.9, color: "#000" }}
              >
                {stat.label}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* RIGHT SECTION (EXACT 50%) */}
      <Box
        component={motion.div}
        sx={{
          width: { xs: "100%", md: "50%" },
          backgroundImage: `url(${heroSide})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: { xs: 300, md: "100vh" },
          filter: "brightness(0.9)",
        }}
        animate={{
          opacity: [1, 0.8, 1],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </Box>
  );
};

export default Hero;
