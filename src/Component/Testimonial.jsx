import React from "react";
import { Box, Typography, Container, Paper } from "@mui/material";
import { motion } from "framer-motion";

const Testimonial = () => {
  return (
    <Box
      sx={{
        py: { xs: 8, md: 10 },
        // backgroundColor: "#0A3D2E", // deep green like figma
        backgroundColor: "wheat",
        textAlign: "center",
      }}
    >
      <Container maxWidth="md">
        {/* Title */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "#fff",
            mb: 4,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Student’s Testimonial
        </Typography>

        {/* White Paper Background */}
        <Paper
          elevation={6}
          sx={{
            borderRadius: 3,
            p: { xs: 2, md: 3 },
            mx: "auto",
            backgroundColor: "#fff",
            maxWidth: 720,
          }}
        >
          {/* Video Frame Animation */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Embedded Video */}
            <Box
              sx={{
                position: "relative",
                width: "100%",
                paddingTop: "56.25%", // 16:9 aspect ratio
                overflow: "hidden",
                borderRadius: 2,
                boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
              }}
            >
              <iframe
                src="https://www.youtube.com/embed/ysz5S6PUM-U"
                title="HGSC² Student Testimonial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  borderRadius: "12px",
                }}
              />
            </Box>
          </motion.div>
        </Paper>
      </Container>
    </Box>
  );
};

export default Testimonial;
