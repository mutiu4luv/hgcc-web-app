import React from "react";
import { School, WorkspacePremium, TrendingUp } from "@mui/icons-material"; // better icons
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import { motion } from "framer-motion";

const PRIMARY_GREEN_DARK = "#006400";
const ACCENT_GREEN_LIGHT = "#6aa84f";
const BORDER_ACCENT = "#d9ead3";

// Updated course data with better icons
const courses = [
  {
    icon: School,
    title: "1 Month Course",
  },
  {
    icon: WorkspacePremium,
    title: "3 Months Course",
  },
  {
    icon: TrendingUp,
    title: "6 Months Course",
  },
];

// Course card component with animation
const CourseCard = ({ icon: Icon, title, description, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: index * 0.2 }}
    whileHover={{ scale: 1.05 }}
  >
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        p: 3,
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        },
        borderTop: `8px solid ${ACCENT_GREEN_LIGHT}`,
        bgcolor: "#fff",
        height: "100%",
      }}
    >
      <CardContent sx={{ flexGrow: 1, width: "100%", p: 0 }}>
        <Avatar
          sx={{
            bgcolor: BORDER_ACCENT,
            width: 64,
            height: 64,
            mb: 2,
            mx: "auto",
          }}
        >
          <Icon sx={{ fontSize: 40, color: PRIMARY_GREEN_DARK }} />
        </Avatar>

        <Typography
          variant="h6"
          component="h3"
          fontWeight="bold"
          mb={1}
          sx={{ color: PRIMARY_GREEN_DARK }}
        >
          {title}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          mb={3}
          sx={{ minHeight: "5rem" }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  </motion.div>
);

const CoursesWeOffer = () => {
  return (
    <Box sx={{ minHeight: "100vh", p: 4, bgcolor: BORDER_ACCENT }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Header */}
        <Box textAlign="center" mb={6} position="relative">
          <Typography
            variant="h3"
            component="h2"
            fontWeight="bold"
            gutterBottom
            sx={{
              color: PRIMARY_GREEN_DARK,
              fontSize: { xs: "2.25rem", sm: "3rem" },
              display: "inline-block",
              position: "relative",
            }}
          >
            COURSES WE OFFER
            {/* Animated underline */}
            <motion.span
              animate={{ width: ["0%", "100%", "0%"] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
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

          <Typography variant="h6" color="text.secondary" mt={2}>
            Choose a path that empowers your future in the digital economy.
          </Typography>
        </Box>

        {/* Centered Grid for Cards */}
        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="stretch"
        >
          {courses.map((course, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <CourseCard {...course} index={index} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default CoursesWeOffer;
