import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Grid,
} from "@mui/material";
import { motion } from "framer-motion";

// Import your assets
import award1 from "../assets/award1.jpeg";
import award2 from "../assets/award2.jpeg";
import award3 from "../assets/award3.jpg";
import award4 from "../assets/award4.jpeg";
import Footer from "../Component/Footer";

// 🎨 Color palette
const PRIMARY = "#0B3D2E";
const ACCENT = "#14CD02";
const BG = "#F3F8F5";

// 🏆 Awards data
const awards = [
  {
    title: "Fast Growing business of the year",
    description:
      "Recognizing our rapid expansion, operational excellence, and the significant market impact achieved through dedicated service and scalability.",
    image: award1,
  },
  {
    title: "Excellence in Digital Education Award",
    description:
      "Recognizing our pioneering efforts in redefining the virtual classroom through seamless technology integration, interactive pedagogy, and the creation of an inclusive digital environment that empowers learners worldwide.",
    image: award2,
  },
  {
    title: "Award of Honor",
    description:
      "A prestigious recognition bestowed for exemplary leadership, unwavering integrity, and a distinguished record of service that has set a benchmark for excellence.",
    image: award3,
  },
  {
    title: "Top Learning Platform",
    description:
      "Celebrating excellence in building accessible, student-centered learning systems.",
    image: award4,
  },
];

const AwardsScreen = () => {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: BG, py: 8 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{ color: PRIMARY, mb: 1 }}
          >
            Our Awards & Recognition
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Celebrating milestones, excellence, and impact in learning
          </Typography>
        </Box>

        {/* Awards Grid */}
        <Grid
          container
          spacing={4}
          alignItems="stretch"
          justifyContent="center" // ✅ center cards
        >
          {awards.map((award, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              key={index}
              sx={{ display: "flex", justifyContent: "center" }} // ✅ center each card
            >
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                whileHover={{ scale: 1.05 }}
                style={{ height: "100%" }}
              >
                <Card
                  sx={{
                    width: "100%",
                    maxWidth: 300, // ✅ equal card width
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                    bgcolor: "#fff",
                  }}
                >
                  {/* Image */}
                  <Box
                    sx={{
                      height: 240,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#fff",
                      px: 2,
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={award.image}
                      alt={award.title}
                      sx={{
                        height: "100%",
                        width: "90%",
                        objectFit: "contain",
                      }}
                    />
                  </Box>

                  {/* Content */}
                  <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ color: PRIMARY, mb: 1 }}
                    >
                      {award.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {award.description}
                    </Typography>
                  </CardContent>

                  {/* Accent bar */}
                  <Box sx={{ height: 6, bgcolor: ACCENT }} />
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
};

export default AwardsScreen;
