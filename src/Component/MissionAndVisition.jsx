import React from "react";
import { GpsFixed, Visibility } from "@mui/icons-material";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  keyframes,
} from "@mui/material";

// Theme colors
const PRIMARY_GREEN_DARK = "#006400";
const ACCENT_GREEN_LIGHT = "#6aa84f";
const BORDER_ACCENT = "#17372A";

// Animation for border drawing inside each card
const drawBorder = keyframes`
  0% {
    height: 0%;
    opacity: 0;
  }
  30% {
    height: 100%;
    opacity: 1;
  }
  60% {
    height: 100%;
    opacity: 1;
  }
  100% {
    height: 0%;
    opacity: 0;
  }
`;

// Mission and Vision Card Component
const MissionVisionCard = ({ type, icon: Icon, text }) => (
  <Box
    sx={{
      position: "relative",
      overflow: "hidden",
      borderRadius: "16px",
      "&::before, &::after": {
        content: '""',
        position: "absolute",
        width: "5px", // thicker line
        bgcolor: "white",
        animation: `${drawBorder} 3s linear infinite`,
        filter: "drop-shadow(0 0 8px white)",
        borderRadius: "4px",
      },
      "&::before": {
        left: "4px", // pushed slightly inside
        top: 0,
      },
      "&::after": {
        right: "4px", // pushed slightly inside
        top: 0,
        animationDelay: "1.5s",
      },
    }}
  >
    <Card
      sx={{
        p: 3,
        borderRadius: "16px",
        bgcolor: BORDER_ACCENT,
        border: `4px solid ${ACCENT_GREEN_LIGHT}`,
        boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
        textAlign: "left",
        height: "100%",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
        },
      }}
    >
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
            pb: 1,
            borderBottom: "2px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <Icon sx={{ fontSize: 32, color: ACCENT_GREEN_LIGHT, mr: 1.5 }} />
          <Typography
            variant="h4"
            component="h3"
            fontWeight="bold"
            sx={{ color: ACCENT_GREEN_LIGHT }}
          >
            {type}
          </Typography>
        </Box>

        {/* Text Section */}
        <Typography
          variant="body1"
          sx={{
            color: "white",
            lineHeight: 1.8,
            fontSize: { xs: "1rem", md: "1.1rem" },
          }}
        >
          {text}
        </Typography>
      </CardContent>
    </Card>
  </Box>
);

// Mission and Vision Data
const goals = [
  {
    type: "Our Mission",
    icon: GpsFixed,
    text: "At HGSC² Digital Skills, our mission is to empower individuals by providing affordable, high-quality digital skills training. We aim to help those with financial limitations gain access to high-paying career opportunities. Our commitment is to exceed expectations, delivering exceptional value and life-changing learning experiences. We strive to achieve this through a combination of comprehensive online courses, personalized mentorship, industrial trainings, in-depth training on tools for job search and partnerships with industry leaders to ensure up-to-date and relevant skill development. Join us on our journey to make a difference. Together, we can bridge the digital divide and create a more equitable future for all.",
  },
  {
    type: "Our Vision",
    icon: Visibility,
    text: "At HGSC² Digital Skills, our vision is to create a world where everyone has access to the digital skills needed to thrive in the 21st century. We envision a future where individuals from all backgrounds can participate in the digital economy, driving innovation and growth. Our goal is to be a catalyst for change, fostering a culture of continuous learning and adaptation to the evolving job market. Together, we can build a more inclusive and equitable digital landscape.",
  },
];

const MissionAndVision = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 4,
        bgcolor: BORDER_ACCENT,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Section Header */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h3"
            component="h2"
            fontWeight="bold"
            gutterBottom
            sx={{
              color: PRIMARY_GREEN_DARK,
              fontSize: { xs: "2.25rem", sm: "3rem" },
              position: "relative",
              display: "inline-block",
            }}
          >
            OUR COMMITMENT
            {/* Underline */}
            <Box
              sx={{
                position: "absolute",
                left: 0,
                bottom: -6,
                width: "100%",
                height: "4px",
                bgcolor: ACCENT_GREEN_LIGHT,
                borderRadius: "2px",
              }}
            />
          </Typography>
        </Box>

        {/* Mission and Vision Cards */}
        <Grid container spacing={4} justifyContent="center">
          {goals.map((goal, index) => (
            <Grid item xs={12} md={6} key={index}>
              <MissionVisionCard
                type={goal.type}
                icon={goal.icon}
                text={goal.text}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default MissionAndVision;
