import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);

  if (!token) {
    // Agar token nahi hai, to login page par redirect kar do
    return <Navigate to="/" replace />;
  }

  // Agar token hai, to allow karo
  return children;
};

export default ProtectedRoute;
