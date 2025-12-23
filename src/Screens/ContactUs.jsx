import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Link,
} from "@mui/material";
import { motion } from "framer-motion";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Footer from "../Component/Footer";

// 🎨 Matching Color Palette
const PRIMARY = "#0B3D2E";
const ACCENT = "#14CD02";
const BG = "#F3F8F5";

const contactDetails = [
  {
    icon: <EmailIcon sx={{ fontSize: 40, color: ACCENT }} />,
    title: "Email Us",
    value: "hgscdigitalskillsacademy@gmail.com",
    link: "mailto:hgscdigitalskillsacademy@gmail.com",
  },
  {
    icon: <PhoneIcon sx={{ fontSize: 40, color: ACCENT }} />,
    title: "Call Us",
    value: "+234 907 165 1329",
    link: "tel:+2349071651329",
  },
  {
    icon: <LocationOnIcon sx={{ fontSize: 40, color: ACCENT }} />,
    title: "Visit Us",
    value: "Coker, Surulere, Lagos State, Nigeria",
    link: "https://maps.google.com/?q=Coker,Surulere,Lagos",
  },
];

const ContactSection = () => {
  return (
    <Box sx={{ py: 10, bgcolor: BG }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box textAlign="center" mb={8}>
          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{
              color: PRIMARY,
              mb: 2,
              fontSize: { xs: "2.2rem", md: "3rem" },
            }}
          >
            Get In Touch
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            Have questions about our programs or want to partner with us? Reach
            out to our team today.
          </Typography>
        </Box>

        {/* Contact Cards Grid */}
        <Grid container spacing={4} justifyContent="center">
          {contactDetails.map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Card
                  sx={{
                    textAlign: "center",
                    borderRadius: "20px",
                    p: 3,
                    height: "100%",
                    boxShadow: "0 15px 35px rgba(0,0,0,0.05)",
                    border: "1px solid rgba(0,0,0,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      bgcolor: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    }}
                  >
                    {item.icon}
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ color: PRIMARY, mb: 1 }}
                    >
                      {item.title}
                    </Typography>
                    <Link
                      href={item.link}
                      underline="none"
                      target="_blank"
                      sx={{
                        color: "text.secondary",
                        fontSize: "1rem",
                        wordBreak: "break-word",
                        transition: "color 0.3s",
                        "&:hover": { color: ACCENT },
                      }}
                    >
                      {item.value}
                    </Link>
                  </CardContent>

                  {/* Decorative Bar */}
                  <Box
                    sx={{
                      width: 40,
                      height: 4,
                      bgcolor: ACCENT,
                      borderRadius: 2,
                      mt: 2,
                    }}
                  />
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

export default ContactSection;
