import React from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Container,
  Avatar,
} from "@mui/material";
import { motion } from "framer-motion";
import founderImg from "../assets/founder.jpg"; // replace with your actual founder image

const FounderSection = () => {
  return (
    <Box
      sx={{
        py: { xs: 8, md: 10 },
        backgroundColor: "#0A3D2E", // matches testimonial background
        color: "#fff",
        textAlign: "center",
      }}
    >
      <Container maxWidth="lg">
        {/* Title */}
        <Typography
          variant="h4"
          color="white"
          sx={{
            fontWeight: "bold",
            mb: { xs: 4, md: 6 },
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Meet Our Founder
        </Typography>

        <Grid container spacing={4} alignItems="center" justifyContent="center">
          {/* Founder Image */}
          <Grid item xs={12} md={5}>
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Avatar
                src={founderImg}
                alt="Founder"
                sx={{
                  width: { xs: 240, md: 300 },
                  height: { xs: 240, md: 300 },
                  border: "4px solid #16A34A",
                  boxShadow: "0px 4px 20px rgba(0,0,0,0.3)",
                  mx: "auto",
                }}
              />
            </motion.div>
          </Grid>

          {/* Founder Text */}
          <Grid item xs={12} md={7}>
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", color: "#4caf50", mb: 1 }}
              >
                Benedicta C. Nwokedi
              </Typography>
              {/* <Typography
                variant="subtitle1"
                sx={{
                  mb: 2,
                  color: "#C8E6C9",
                  fontWeight: 500,
                }}
              >
                Management and Human Resource Consultant
              </Typography> */}
              <Typography
                variant="body1"
                sx={{
                  color: "#E0E0E0",
                  lineHeight: 1.8,
                  maxWidth: 600,
                  mx: "auto",
                  mb: 3,
                  textAlign: "justify",
                }}
              >
                Benedicta C. Nwokedi is the visionary CEO and Founder of HGSC²
                Digital Skills Academy LTD, a global platform transforming lives
                through digital empowerment. Known as “A Lady with a
                Difference,” she has built something remarkable since 2023
                turning a small online community into an international
                registered academy that has trained and certified close to 2,000
                students across 18 countries and impacted over 4,000 lives
                through free training programs. She also serves as a Senior
                Phlebotomist in the UK 🇬🇧 , Lead Trainer for Professional Coach
                Certification at HGSC², and Founder of Ladies with Difference
                and A Different Visibility Community. She is a 5x published
                author and a multi-award-winning leader, recognized as Young
                Personality of the Year (TIBA), Female CEO of the Year (Nigeria)
                by CEO UK 🇬🇧 , Inspirational Thought Leader (Future Leadership
                Conference) and many others.
              </Typography>

              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#16A34A",
                  color: "#fff",
                  fontWeight: "bold",
                  px: 4,
                  "&:hover": {
                    backgroundColor: "#128C3D",
                  },
                }}
              >
                Connect With The CEO
              </Button>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default FounderSection;
