import React from "react";
import { Box, Container, Typography } from "@mui/material";
import alumni1 from "../assets/alumni1.jpg";
import alumni2 from "../assets/alumni2.jpg";
import alumni3 from "../assets/alumni3.jpg";

const MeetOurAlumni = () => {
  const alumni = [
    { id: 1, img: alumni1, alt: "Alumni 1" },
    { id: 2, img: alumni2, alt: "Alumni 2" },
    { id: 3, img: alumni3, alt: "Alumni 3" },
  ];

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: "#f9fafb" }}>
      <Container maxWidth="lg">
        {/* Title */}
        <Typography
          variant="h4"
          align="center"
          fontWeight="bold"
          gutterBottom
          sx={{ color: "#065f46" }}
        >
          Meet Our Alumni
        </Typography>

        {/* Grid Layout */}
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gridTemplateAreas: {
              xs: `"img1" "img2" "img3"`,
              md: `"img1 img2" "img3 img3"`,
            },
            justifyItems: "center",
            alignItems: "center",
            mt: 4,
          }}
        >
          {alumni.map((alum, index) => (
            <Box
              key={alum.id}
              sx={{
                gridArea: index === 0 ? "img1" : index === 1 ? "img2" : "img3",
                width: { xs: "100%", md: "500px" },
                height: { xs: "auto", md: "350px" },
                justifySelf: index === 2 ? "center" : "auto",
              }}
            >
              <Box
                component="img"
                src={alum.img}
                alt={alum.alt}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 3,
                  boxShadow: 3,
                  display: "block",
                }}
              />
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default MeetOurAlumni;
