import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Stack,
} from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Testimonial = () => {
  const [videos, setVideos] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const sliderRef = useRef(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/videos`
        );
        if (res.data.length > 0) setVideos(res.data);
      } catch (err) {
        console.error("❌ Error fetching videos:", err);
        setError("Failed to load testimonial videos");
      }
    };

    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/announcement`
        );
        console.log("anouncement", res);
        if (res.data.announcements?.length > 0) {
          setAnnouncements(res.data.announcements);
        }
      } catch (err) {
        console.error("❌ Error fetching announcements:", err);
      }
    };

    Promise.all([fetchVideos(), fetchAnnouncements()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
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
        {/* TESTIMONIALS */}
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
            <Slider ref={sliderRef} {...sliderSettings}>
              {videos.map((video) => (
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
                      paddingTop: "56.25%",
                      overflow: "hidden",
                      borderRadius: 2,
                      boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
                    }}
                  >
                    <video
                      src={video.videoUrl}
                      controls
                      onEnded={() =>
                        sliderRef.current && sliderRef.current.slickNext()
                      }
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
                    sx={{ mt: 2, color: "green", fontWeight: "bold" }}
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

        {/* ANNOUNCEMENTS */}
        {announcements.length > 0 && (
          <Paper
            elevation={6}
            sx={{
              borderRadius: 3,
              p: { xs: 3, md: 4 },
              mt: 6,
              background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
              color: "#fff",
            }}
          >
            {announcements.map((a) => (
              <Box key={a._id} sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                  📢 {a.title}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {a.message}
                </Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  justifyContent="center"
                >
                  <Button
                    variant="contained"
                    color="secondary"
                    href="https://t.me/YourTelegramLink"
                    target="_blank"
                  >
                    Telegram
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    href="https://www.youtube.com/YourYouTubeChannel"
                    target="_blank"
                  >
                    YouTube
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    href="https://wa.me/YourWhatsAppNumber"
                    target="_blank"
                  >
                    WhatsApp
                  </Button>
                </Stack>
              </Box>
            ))}
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default Testimonial;
