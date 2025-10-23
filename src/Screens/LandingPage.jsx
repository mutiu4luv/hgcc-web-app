import Hero from "../Component/HeroSection";
import Testimonials from "../Component/Testimonial";
import VisionMission from "../Component/VisionMission";
import NavBar from "../Component/NavBar";
import FounderSection from "../Component/Founder";
import CoursesSection from "../Component/SpecialCousesSection";
import Course from "../Component/Course";

const LandingPage = () => {
  return (
    <div>
      {/* <NavBar /> */}
      <Hero />
      <Testimonials />
      <FounderSection />
      <Course />
      <CoursesSection />
      {/* <VisionMission /> */}
    </div>
  );
};

export default LandingPage;
