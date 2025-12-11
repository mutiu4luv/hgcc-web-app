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

// Icons
import TelegramIcon from "@mui/icons-material/Telegram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

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
            backgroundColor: "#fff",
            maxWidth: 720,
            mx: "auto",
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
            <Typography sx={{ mt: 2 }}>
              No testimonial videos available yet.
            </Typography>
          )}
        </Paper>

        {/* ANNOUNCEMENTS */}
        {announcements.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Paper
              elevation={12}
              sx={{
                borderRadius: 4,
                p: { xs: 4, md: 6 },
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#fff",
              }}
            >
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

              <Box sx={{ pl: { xs: 6, sm: 10 }, position: "relative" }}>
                {announcements.map((a, index) => (
                  <motion.div
                    key={a._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    style={{ marginBottom: "32px", position: "relative" }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {a.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "1rem",
                        lineHeight: 1.5,
                        color: "yellow",
                      }}
                    >
                      {a.message}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 1, flexWrap: "wrap" }}
                    >
                      {/* WHATSAPP BUTTON */}
                      {a.button === "whatsapp" && (
                        <motion.div whileHover={{ scale: 1.05 }}>
                          <Button
                            variant="contained"
                            startIcon={<WhatsAppIcon />}
                            sx={{
                              backgroundColor: "#25D366",
                              color: "#fff",
                              "&:hover": { backgroundColor: "#1DA851" },
                            }}
                            href={a.whatsappLink}
                            target="_blank"
                            size="small"
                          >
                            WhatsApp
                          </Button>
                        </motion.div>
                      )}

                      {/* TELEGRAM BUTTON (RED + WHITE + ICON) */}
                      {a.button === "telegram" && (
                        <motion.div whileHover={{ scale: 1.08 }}>
                          <Button
                            variant="contained"
                            startIcon={<TelegramIcon />}
                            sx={{
                              backgroundColor: "red",
                              color: "white",
                              fontWeight: "bold",
                              "&:hover": { backgroundColor: "#b30000" },
                            }}
                            href={a.telegramLink}
                            target="_blank"
                            size="small"
                          >
                            Telegram
                          </Button>
                        </motion.div>
                      )}

                      {/* YOUTUBE BUTTON (STRONGER APPEARANCE) */}
                      {a.button === "youtube" && (
                        <motion.div whileHover={{ scale: 1.08 }}>
                          <Button
                            variant="contained"
                            startIcon={<YouTubeIcon />}
                            sx={{
                              backgroundColor: "#FF0000",
                              color: "white",
                              fontWeight: "bold",
                              "&:hover": { backgroundColor: "#CC0000" },
                            }}
                            href={a.youtubeLink}
                            target="_blank"
                            size="small"
                          >
                            YouTube
                          </Button>
                        </motion.div>
                      )}
                    </Stack>
                  </motion.div>
                ))}
              </Box>
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Testimonial;
