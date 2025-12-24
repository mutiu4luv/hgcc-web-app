import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./Screens/LandingPage";
import Navbar from "./Component/NavBar";
import Register from "./Screens/Register";
import ConfirmCode from "./Screens/Confirm";
import LoginForm from "./Screens/Login";
import ProtectedRoute from "./Component/ProtectedRoute";
import AdminOwner from "./Admin/AdminOwner";
import AdminCoach from "./Admin/AdminCoachesScreen";
import AdminStudent from "./Admin/AdminStudent";
import PaymentScreen from "./Screens/Payment";
import SelfLearningPayment from "./Screens/SelfLearningPayment";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OffersPage from "./Screens/Offers";
import SpecialOffer from "./Screens/SpecialOffer";
import AwardsScreen from "./Screens/Award";
import ContactSection from "./Screens/ContactUs";
import ProfileScreen from "./Screens/Profile";
import ForgotPassword from "./Screens/ForgotPassword";
import ResetPassword from "./Screens/ResetPassword";

function App() {
  const [count, setCount] = useState(0);
  const token = localStorage.getItem("token");

  return (
    <>
      <Navbar />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/confirm" element={<ConfirmCode />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/special" element={<SpecialOffer />} />
        <Route path="/awards" element={<AwardsScreen />} />
        <Route path="/contact" element={<ContactSection />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/payment/:cohortId/:courseId"
          element={<PaymentScreen token={token} />}
        />{" "}
        <Route
          path="/owner"
          element={
            <ProtectedRoute>
              <AdminOwner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach"
          element={
            <ProtectedRoute>
              <AdminCoach />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute>
              <AdminStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/payment/:courseId"
          element={<SelfLearningPayment />}
        />
      </Routes>
    </>
  );
}

export default App;
