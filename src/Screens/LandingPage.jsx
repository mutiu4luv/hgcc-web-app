import Hero from "../Component/HeroSection";
import Testimonials from "../Component/Testimonial";
import VisionMission from "../Component/VisionMission";
import NavBar from "../Component/NavBar";
import FounderSection from "../Component/Founder";

const LandingPage = () => {
  return (
    <div>
      {/* <NavBar /> */}
      <Hero />
      <Testimonials />
      <FounderSection />
      {/* <VisionMission /> */}
    </div>
  );
};

export default LandingPage;
