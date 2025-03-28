import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

// Import pages
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { AuthContextProvider } from "./context/AuthContext";

function App() {
  return (
    <>
      <AuthContextProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/signup" />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Signup" element={<Signup />} />
        </Routes>
      </AuthContextProvider>
    </>
  );
}

export default App;
