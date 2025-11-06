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

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/confirm" element={<ConfirmCode />} />
        <Route path="/login" element={<LoginForm />} />
        <Route
          path="/owner"
          element={
            <ProtectedRoute>
              <AdminOwner />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
