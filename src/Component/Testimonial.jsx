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
                <Box
                  sx={{
                    position: "relative",
                    mt: 6,
                    overflow: "hidden",
                    minHeight: 350,
                    borderRadius: 4,
                    background:
                      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    p: 4,
                  }}
                >
                  {/* Rain animation layer */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      zIndex: 0,
                      overflow: "hidden",
                      pointerEvents: "none",
                    }}
                  >
                    {[...Array(50)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ y: -50 }}
                        animate={{ y: ["-50%", "100%"] }}
                        transition={{
                          repeat: Infinity,
                          duration: Math.random() * 2 + 2, // random speed
                          delay: Math.random() * 2,
                          ease: "linear",
                        }}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: `${Math.random() * 100}%`,
                          width: 2,
                          height: Math.random() * 15 + 10,
                          background: "rgba(255,255,255,0.3)",
                          borderRadius: "50%",
                        }}
                      />
                    ))}
                  </Box>

                  {/* Announcement Cards */}
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={4}
                    sx={{ overflowX: "auto", position: "relative", zIndex: 1 }}
                  >
                    {announcements.length > 0 && (
                      <Box sx={{ position: "relative", mt: 6 }}>
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{
                            repeat: Infinity,
                            duration: 3,
                            ease: "easeInOut",
                          }}
                          style={{
                            position: "absolute",
                            top: -40,
                            left: -60,
                            width: 100,
                            height: 100,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.1)",
                            zIndex: 0,
                          }}
                        />
                        <motion.div
                          animate={{ x: [0, 15, -15, 0] }}
                          transition={{
                            repeat: Infinity,
                            duration: 5,
                            ease: "easeInOut",
                          }}
                          style={{
                            position: "absolute",
                            bottom: -50,
                            right: -50,
                            width: 120,
                            height: 120,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.15)",
                            zIndex: 0,
                          }}
                        />

                        <Paper
                          elevation={12}
                          sx={{
                            borderRadius: 4,
                            p: { xs: 3, md: 5 },
                            background:
                              "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            color: "#fff",
                            overflow: "hidden",
                            position: "relative",
                          }}
                        >
                          {announcements.map((a) => (
                            <motion.div
                              key={a._id}
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              whileHover={{
                                scale: 1.03,
                                boxShadow: "0px 12px 24px rgba(0,0,0,0.3)",
                              }}
                              style={{
                                marginBottom: "24px",
                                padding: "20px",
                                borderRadius: "16px",
                                background: "rgba(255,255,255,0.1)",
                                borderLeft: "6px solid #fff",
                                backdropFilter: "blur(5px)",
                              }}
                            >
                              <Typography
                                variant="h5"
                                sx={{
                                  fontWeight: "bold",
                                  mb: 1,
                                  fontSize: "1.7rem",
                                  letterSpacing: 0.5,
                                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                                }}
                              >
                                📢 {a.title}
                              </Typography>

                              <Typography
                                variant="body1"
                                sx={{
                                  mb: 2,
                                  fontSize: "1.2rem",
                                  lineHeight: 1.6,
                                  textShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                }}
                              >
                                {a.message}
                              </Typography>

                              {/* Animated Buttons */}
                              <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={2}
                                justifyContent="center"
                              >
                                {a.button === "whatsapp" && (
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 300,
                                    }}
                                  >
                                    <Button
                                      variant="contained"
                                      color="success"
                                      href={
                                        a.whatsappLink ||
                                        "https://wa.me/2340000000000"
                                      }
                                      target="_blank"
                                      sx={{
                                        fontSize: "1rem",
                                        fontWeight: "bold",
                                        boxShadow:
                                          "0px 4px 12px rgba(0,0,0,0.2)",
                                      }}
                                    >
                                      WhatsApp
                                    </Button>
                                  </motion.div>
                                )}
                                {a.button === "telegram" && (
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 300,
                                    }}
                                  >
                                    <Button
                                      variant="contained"
                                      color="secondary"
                                      href={
                                        a.telegramLink ||
                                        "https://t.me/yourTelegramChannel"
                                      }
                                      target="_blank"
                                      sx={{
                                        fontSize: "1rem",
                                        fontWeight: "bold",
                                        boxShadow:
                                          "0px 4px 12px rgba(0,0,0,0.2)",
                                      }}
                                    >
                                      Telegram
                                    </Button>
                                  </motion.div>
                                )}
                                {a.button === "youtube" && (
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 300,
                                    }}
                                  >
                                    <Button
                                      variant="contained"
                                      color="error"
                                      href={
                                        a.youtubeLink || "https://youtube.com"
                                      }
                                      target="_blank"
                                      sx={{
                                        fontSize: "1rem",
                                        fontWeight: "bold",
                                        boxShadow:
                                          "0px 4px 12px rgba(0,0,0,0.2)",
                                      }}
                                    >
                                      YouTube
                                    </Button>
                                  </motion.div>
                                )}
                              </Stack>
                            </motion.div>
                          ))}
                        </Paper>
                      </Box>
                    )}
                  </Stack>
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
