import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Testimonial = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const sliderRef = useRef(null); // <-- add ref

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/videos`
        );
        if (res.data.length > 0) {
          setVideos(res.data);
        }
      } catch (err) {
        console.error("❌ Error fetching videos:", err);
        setError("Failed to load testimonial videos");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false, // turn off auto play
    arrows: true,
    adaptiveHeight: true,
  };

  return (
    <Box
      sx={{
        py: { xs: 8, md: 10 },
        backgroundColor: "wheat",
        textAlign: "center",
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "green",
            mb: 4,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Student’s Testimonial
        </Typography>

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
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : videos.length > 0 ? (
            <Slider ref={sliderRef} {...settings}>
              {videos.map((video, index) => (
                <motion.div
                  key={video._id}
                  initial={{ scale: 0.95, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      paddingTop: "56.25%", // 16:9
                      overflow: "hidden",
                      borderRadius: 2,
                      boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
                    }}
                  >
                    <video
                      src={video.videoUrl}
                      controls
                      onEnded={() => {
                        if (sliderRef.current) sliderRef.current.slickNext();
                      }}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        borderRadius: "12px",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      mt: 2,
                      color: "green",
                      fontWeight: "bold",
                    }}
                  >
                    {video.title || "Student Testimonial"}
                  </Typography>
                </motion.div>
              ))}
            </Slider>
          ) : (
            <Typography variant="body1" sx={{ mt: 2 }}>
              No testimonial videos available yet.
            </Typography>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Testimonial;
