import React from "react";
import "./index.css";
import { Routes, Route } from "react-router-dom";
import Home from "../src/components/pages/Home";
import Login from "../src/components/login/Login";
import Signup from "../src/components/signup/Signup";
import Verifyemail from "../src/components/login/Verifyemail";
import Error from "../src/components/login/Error";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute"; // 👈 import

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verifyemail" element={<Verifyemail />} />

        {/* ✅ Protected route for Home */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Error />} />
      </Routes>
    </div>
  );
}

export default App;
