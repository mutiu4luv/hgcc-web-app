import React from "react";
import { Dashboard, Code, FlashOn, Book } from "@mui/icons-material";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const PRIMARY_GREEN_DARK = "#006400";
const ACCENT_GREEN_LIGHT = "#6aa84f";
const BORDER_ACCENT = "#d9ead3";

// === COURSE DATA ===
const courses = [
  {
    icon: Dashboard,
    title: "Self-paced Learning",
    description: "Learn anytime, anywhere at your own pace.",
    buttonText: "Register Now",
    route: "/student/dashboard",
  },
  {
    icon: Code,
    title: "Free Courses",
    description:
      "Start your learning journey with zero cost and no commitments.",
    buttonText: "Register Now",
    route: "/student/dashboard",
  },
  {
    icon: FlashOn,
    title: "Live Classes",
    description:
      "Join interactive sessions and learn directly from expert mentors.",
    buttonText: "Register Now",
    route: "/student/dashboard",
  },
  {
    icon: Book,
    title: "Alumni Community",
    description:
      "Learn, network, and thrive with those who’ve walked the same path.",
    buttonText: "Register Now",
  },
];

// === COURSE CARD COMPONENT ===
const CourseCard = ({
  icon: Icon,
  title,
  description,
  buttonText,
  route,
  index,
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      whileHover={{ scale: 1.05 }}
    >
      <Card
        sx={{
          flex: "1 1 30%",
          minWidth: "280px",
          maxWidth: "350px",
          p: 2,
          textAlign: "center",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          borderTop: `6px solid ${ACCENT_GREEN_LIGHT}`,
          bgcolor: "#fff",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Avatar
            sx={{
              bgcolor: BORDER_ACCENT,
              width: 56,
              height: 56,
              mb: 2,
              mx: "auto",
            }}
          >
            <Icon sx={{ fontSize: 32, color: PRIMARY_GREEN_DARK }} />
          </Avatar>

          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{ color: PRIMARY_GREEN_DARK }}
            mb={1}
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            mb={3}
            sx={{ minHeight: "4rem" }}
          >
            {description}
          </Typography>
        </CardContent>

        <Button
          variant="contained"
          fullWidth
          sx={{
            bgcolor: "#14CD02",
            fontWeight: "bold",
            py: 1,
            borderRadius: "6px",
            "&:hover": { bgcolor: PRIMARY_GREEN_DARK },
          }}
          onClick={() => navigate(route)}
        >
          {buttonText}
        </Button>
      </Card>
    </motion.div>
  );
};

// === MAIN COMPONENT ===
const SpecialOffer = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ minHeight: "100vh", py: 6, bgcolor: BORDER_ACCENT }}>
      <Container maxWidth="lg">
        {/* HEADER */}
        <Box textAlign="center" mb={5}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              color: "black",
              fontSize: { xs: "1.8rem", sm: "2.5rem" },
              position: "relative",
              display: "inline-block",
            }}
          >
            SPECIAL OFFER
            <motion.span
              animate={{ width: ["0%", "100%", "0%"] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                position: "absolute",
                left: 0,
                bottom: -5,
                height: "3px",
                backgroundColor: "black",
              }}
            />
          </Typography>

          <Typography variant="h6" color="text.secondary" mt={2}>
            Choose a path that empowers your future in the digital economy.
          </Typography>
        </Box>

        {/* COURSE GRID */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 3,
          }}
        >
          {courses.map((course, index) => (
            <CourseCard key={index} {...course} index={index} />
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default SpecialOffer;
