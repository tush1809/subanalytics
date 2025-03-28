import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "./header.css";
import { useAuthContext } from "../hooks/useAuthContext.js";
import { useLogout } from "../hooks/useLogout.js";

const Header = () => {
  const { user } = useAuthContext();
  const { logout } = useLogout();

  const handleLogout = () => {
    console.log("logging out...");
    logout();
  };

  return (
    <div className="header-wrapper">
      <h1 className="logo-title">
        <Link to="/" className="logo-link">
          SubAnalytics
        </Link>
      </h1>
      <div className="nav-links">
        {user && (
          <>
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
