// src/admin/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    const isExpired = decoded.exp * 1000 < Date.now();
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const storedUserId = storedUser?._id || storedUser?.id || "";
    const tokenUserId = decoded?.id || "";

    if (isExpired || (storedUserId && tokenUserId && storedUserId !== tokenUserId)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userName");
      localStorage.removeItem("userPhoto");
      localStorage.removeItem("userCohorts");
      localStorage.removeItem("selectedCohortId");
      return <Navigate to="/login" replace />;
    }
  } catch (err) {
    console.error("Invalid token:", err);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userName");
    localStorage.removeItem("userPhoto");
    localStorage.removeItem("userCohorts");
    localStorage.removeItem("selectedCohortId");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
