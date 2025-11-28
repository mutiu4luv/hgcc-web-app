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
        console.log("📢 Announcements fetched:", res.data);

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
        {/* ----------------------------------------- */}
        {/* STUDENT TESTIMONIAL SECTION */}
        {/* ----------------------------------------- */}
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

        {/* ----------------------------------------- */}
        {/* ANNOUNCEMENT SECTION */}
        {/* ----------------------------------------- */}
        {announcements.length > 0 && (
          <Box sx={{ position: "relative", mt: 6 }}>
            {/* Background animated gradient bars */}
            <motion.div
              animate={{ x: [0, 30, -30, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              style={{
                position: "absolute",
                top: -20,
                left: -50,
                width: 200,
                height: 8,
                borderRadius: 4,
                background: "rgba(255,255,255,0.15)",
                zIndex: 0,
              }}
            />
            <motion.div
              animate={{ x: [-20, 20, -20] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              style={{
                position: "absolute",
                bottom: 10,
                right: -60,
                width: 180,
                height: 6,
                borderRadius: 4,
                background: "rgba(255,255,255,0.1)",
                zIndex: 0,
              }}
            />

            <Paper
              elevation={12}
              sx={{
                borderRadius: 4,
                p: { xs: 4, md: 6 },
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#fff",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {announcements.length > 0 && (
                <Box sx={{ mt: 6, px: { xs: 2, sm: 4 } }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      mb: 4,
                      textAlign: "center",
                      color: "#065f46",
                    }}
                  >
                    📢 Announcements
                  </Typography>

                  <Box
                    sx={{
                      position: "relative",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        left: { xs: 20, sm: 40 },
                        top: 0,
                        bottom: 0,
                        width: "4px",
                        bgcolor: "success.light",
                        borderRadius: "2px",
                      },
                      pl: { xs: 6, sm: 10 },
                    }}
                  >
                    {announcements.map((a, index) => (
                      <motion.div
                        key={a._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        style={{
                          position: "relative",
                          marginBottom: "32px",
                          cursor: "default",
                        }}
                      >
                        {/* Timeline Dot */}
                        <Box
                          sx={{
                            position: "absolute",
                            left: { xs: 12, sm: 32 },
                            top: 0,
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            bgcolor: "success.main",
                            border: "3px solid #fff",
                          }}
                        />

                        {/* Content */}
                        <Box
                          sx={{
                            ml: { xs: 4, sm: 6 },
                            p: 2,
                            borderRadius: 2,
                            transition: "all 0.2s ease-in-out",
                            "&:hover": {
                              backgroundColor: "rgba(16, 185, 129, 0.1)",
                            },
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              fontSize: { xs: "1rem", sm: "1.1rem" },
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            {a.title}
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: { xs: "0.9rem", sm: "1rem" },
                              lineHeight: 1.5,
                              color: "#065f46",
                            }}
                          >
                            {a.message}
                          </Typography>

                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={1}
                            sx={{ mt: 1 }}
                          >
                            {a.button === "whatsapp" && (
                              <Button
                                variant="outlined"
                                color="success"
                                size="small"
                                href={
                                  a.whatsappLink ||
                                  "https://wa.me/2340000000000"
                                }
                                target="_blank"
                              >
                                WhatsApp
                              </Button>
                            )}
                            {a.button === "telegram" && (
                              <Button
                                variant="outlined"
                                color="secondary"
                                size="small"
                                href={
                                  a.telegramLink ||
                                  "https://t.me/yourTelegramChannel"
                                }
                                target="_blank"
                              >
                                Telegram
                              </Button>
                            )}
                            {a.button === "youtube" && (
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                href={a.youtubeLink || "https://youtube.com"}
                                target="_blank"
                              >
                                YouTube
                              </Button>
                            )}
                          </Stack>
                        </Box>
                      </motion.div>
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Testimonial;
