import React from "react";
import { School, WorkspacePremium, TrendingUp } from "@mui/icons-material";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
import { motion } from "framer-motion";

const PRIMARY_GREEN_DARK = "#006400";
const ACCENT_GREEN_LIGHT = "#6aa84f";
const BORDER_ACCENT = "#d9ead3";
const BUTTON_GREEN = "#14CD02";

// Course data - I added more items to the 1 Month Course to demonstrate the scroll
const courses = [
  {
    icon: School,
    title: "1 Month Course",
    description: [
      "- COPYWRITING ",
      "- VIDEO EDITING ",
      "- GHOSTWRITING  ",
      "- FASHION DESIGN ",
      "- HEALTH WRITING ",

      "- PUBLIC SPEAKING",
      "- CONTENT WRITING",
      "- LINKEDIN FULL COURSE ",
      "- PROFESSIONAL COACHING",
      "- SOCIAL MEDIA MANAGEMENT",
      "- ⁠FACEBOOK VISIBILITY",
      "- Digital Marketing",
      "- SEO writing",
      "- Community Management",
    ],
  },
  {
    icon: WorkspacePremium,
    title: "3 Months Course",
    description: [
      "Data Analytics",
      "UI/UX Design",
      "Product/Project Management",
    ],
  },
  {
    icon: TrendingUp,
    title: "6 Months Course",
    description: ["Full Stack", "AI Programming", "Cyber Security"],
  },
];

// Course card component
const CourseCard = ({ icon: Icon, title, description, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: index * 0.2 }}
    whileHover={{ scale: 1.05 }}
    style={{ height: "100%" }}
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
        height: "100%", // Ensures cards are the same height in the grid
        width: 300,
      }}
    >
      <CardContent
        sx={{
          flexGrow: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 0, // Reset padding for better control
          "&:last-child": { pb: 0 },
        }}
      >
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
          mb={2}
          sx={{ color: PRIMARY_GREEN_DARK }}
        >
          {title}
        </Typography>

        {/* --- SCROLLABLE CONTAINER --- */}
        <Box
          sx={{
            width: "100%",
            maxWidth: 280,
            maxHeight: 200, // Limits the list height
            overflowY: "auto", // Enables scrollbar
            mb: 2,
            pr: 1, // Space for the scrollbar
            flexGrow: 1,
            // Custom Scrollbar Styling
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: BORDER_ACCENT,
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: ACCENT_GREEN_LIGHT,
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: PRIMARY_GREEN_DARK,
            },
          }}
        >
          <List dense disablePadding sx={{ textAlign: "left" }}>
            {description.map((item, i) => (
              <ListItem key={i} sx={{ py: 0.3 }}>
                <ListItemText
                  primaryTypographyProps={{
                    fontSize: "0.95rem",
                    color: "text.secondary",
                  }}
                  primary={`• ${item}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Learn More Button */}
        {/* <Button
          variant="contained"
          sx={{
            mt: "auto", // Pushes button to the bottom
            backgroundColor: BUTTON_GREEN,
            color: "#fff",
            borderRadius: "30px",
            textTransform: "none",
            px: 4,
            py: 1,
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "#0ea800",
            },
          }}
        >
          Learn More
        </Button> */}
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

        {/* Grid for Cards */}
        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="stretch"
        >
          {courses.map((course, index) => (
            <Grid
              item
              key={index}
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CourseCard {...course} index={index} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default CoursesWeOffer;
