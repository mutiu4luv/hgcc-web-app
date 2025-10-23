import React from "react";
import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import { CheckCircleOutline } from "@mui/icons-material";
import { motion } from "framer-motion";

const DEEP_BACKGROUND = "#0d1b2a";
const ACCENT_GREEN_LIGHT = "#16a34a";

const sideBenefits = [
  "Professional Certificate — Earn a recognized certificate that proves your digital expertise and boosts your career opportunities.",
  "Direct Job Referrals — Get connected to hiring partners and land real job opportunities, no endless searching.",
  "Industry Training Experience — Gain hands-on experience through real-world industry projects and collaborations.",
  "Best Student Recognition — Stand out and get rewarded for excellence with our Best Student Award.",
  "Career-Ready Toolkit — Learn to build your portfolio, craft winning CVs, and master job-hunting tools.",
  "Exclusive Expert Community Access — Join a thriving network of mentors, professionals, and learners across multiple digital fields.",
];

const Benefits = () => {
  return (
    <Box
      sx={{
        bgcolor: DEEP_BACKGROUND,
        py: 8,
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
      }}
    >
      <Container maxWidth="md">
        {/* --- Section Header --- */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          textAlign="center"
          mb={6}
        >
          <Typography
            variant="h4"
            component="h2"
            fontWeight="bold"
            gutterBottom
            sx={{
              color: ACCENT_GREEN_LIGHT,
              fontSize: { xs: "1.75rem", sm: "2.5rem" },
            }}
          >
            SIDE BENEFITS UPON COMPLETING YOUR COURSE
          </Typography>
        </Box>

        {/* --- Benefits List --- */}
        <List
          sx={{
            color: "white",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {sideBenefits.map((benefit, index) => {
            const [title, description] = benefit.split(" — ");
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.2,
                  ease: "easeOut",
                }}
              >
                <Paper
                  elevation={6}
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.05)",
                    border: `2px solid ${ACCENT_GREEN_LIGHT}`,
                    borderRadius: "12px",
                    transition: "all 0.3s ease",
                    p: 2,
                    "&:hover": {
                      bgcolor: "rgba(22, 163, 74, 0.12)",
                      transform: "translateY(-5px)",
                      boxShadow: `0 8px 25px ${ACCENT_GREEN_LIGHT}55`,
                    },
                  }}
                >
                  <ListItem alignItems="flex-start">
                    <ListItemIcon sx={{ minWidth: "45px", mt: 0.5 }}>
                      <CheckCircleOutline
                        sx={{ color: ACCENT_GREEN_LIGHT, fontSize: 28 }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          sx={{ color: ACCENT_GREEN_LIGHT, mb: 0.5 }}
                        >
                          {title}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body1"
                          sx={{
                            color: "white",
                            opacity: 0.85,
                            lineHeight: 1.7,
                          }}
                        >
                          {description}
                        </Typography>
                      }
                    />
                  </ListItem>
                </Paper>
              </motion.div>
            );
          })}
        </List>
      </Container>
    </Box>
  );
};

export default Benefits;
