import { useMemo, useState } from "react";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import {
  Home,
  LocalOffer,
  School,
  ContactMail,
  Person,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Hero from "../Component/HeroSection";
import Testimonials from "../Component/Testimonial";
import VisionMission from "../Component/VisionMission";
import NavBar from "../Component/NavBar";
import FounderSection from "../Component/Founder";
import CoursesSection from "../Component/SpecialCousesSection";
import Course from "../Component/Course";
import MissionAndVision from "../Component/MissionAndVisition";
import Benefits from "../Component/Benefits";
import Footer from "../Component/Footer";
import Allumini from "../Component/Allumini";

const LandingPage = () => {
  const navigate = useNavigate();
  const [navValue, setNavValue] = useState("home");
  const user = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "{}"),
    []
  );

  return (
    <div style={{ paddingBottom: "70px" }}>
      {/* <NavBar /> */}
      <Hero />
      <Testimonials />
      <Course />
      <FounderSection />

      <CoursesSection />
      <MissionAndVision />
      <VisionMission />
      <Allumini />
      <Benefits />
      <Footer />

      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          display: { xs: "block", md: "none" },
        }}
        elevation={8}
      >
        <BottomNavigation
          value={navValue}
          onChange={(_, next) => {
            setNavValue(next);
            if (next === "home") navigate("/");
            if (next === "offers") navigate("/offers");
            if (next === "courses") navigate("/special");
            if (next === "contact") navigate("/contact");
            if (next === "account") {
              if (user?.role === "owner") navigate("/owner");
              else if (user?.role === "coach") navigate("/coach");
              else if (user?.role === "student") navigate("/student/dashboard");
              else navigate("/login");
            }
          }}
          showLabels
        >
          <BottomNavigationAction label="Home" value="home" icon={<Home />} />
          <BottomNavigationAction
            label="Offers"
            value="offers"
            icon={<LocalOffer />}
          />
          <BottomNavigationAction
            label="Courses"
            value="courses"
            icon={<School />}
          />
          <BottomNavigationAction
            label="Contact"
            value="contact"
            icon={<ContactMail />}
          />
          <BottomNavigationAction
            label={user?.role ? "Dashboard" : "Login"}
            value="account"
            icon={<Person />}
          />
        </BottomNavigation>
      </Paper>
    </div>
  );
};

export default LandingPage;
