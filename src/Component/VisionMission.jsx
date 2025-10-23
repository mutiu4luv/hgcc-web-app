import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import aboutImg from "../assets/hgsc.jpg"; // 🔁 replace with your image path

const AboutHGSC = () => {
  return (
    <Box
      sx={{
        bgcolor: "#f5f5f5",
        py: { xs: 6, md: 10 },
        textAlign: "center",
      }}
    >
      <Container maxWidth="md">
        {/* Image Section */}
        <motion.img
          src={aboutImg}
          alt="About HGSC² Digital Skills"
          style={{
            width: "70%",
            borderRadius: "16px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
          }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
        />

        {/* Text Section */}
        <Typography
          variant="body1"
          textAlign={"left"}
          sx={{
            mt: 4,
            mb: 4,
            color: "#17372A",
            fontSize: "1.1rem",
            lineHeight: 1.8,
          }}
        >
          At HGSC² Digital Skills Academy we don’t stop at teaching, we help you
          turn your skills into confidence, clients, and income.
        </Typography>

        {/* Register Button */}
        <Button
          variant="contained"
          size="large"
          sx={{
            bgcolor: "#006400",
            color: "#fff",
            px: 5,
            py: 1.2,
            fontWeight: "bold",
            borderRadius: "30px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            "&:hover": {
              bgcolor: "#6aa84f",
              transform: "translateY(-2px)",
              transition: "0.3s",
            },
          }}
        >
          Register Now
        </Button>
      </Container>
    </Box>
  );
};

export default AboutHGSC;
