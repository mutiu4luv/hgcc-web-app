// src/admin/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ If no token or user data, redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Allow access only to owner, coach, or student
  const allowedRoles = ["owner", "coach", "student"];
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
