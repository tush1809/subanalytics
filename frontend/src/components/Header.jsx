import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./header.css";

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn"));

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(null); 
    navigate("/login");
  };

  return (
    <div className="header-wrapper">
      <h1 className="logo-title">
        <Link to="/" className="logo-link">SubAnalytics</Link>
      </h1>
      <div className="nav-links">
        {isLoggedIn ? (
          <>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Header;
