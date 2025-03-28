import React from "react";
import { Link } from "react-router-dom";
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
        {user ? (<Link to="/dashboard" className="logo-link">
          SubAnalytics
        </Link>) : "SubAnalytics"}
      </h1>
      <div className="nav-links">
        {user && (
          <>
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <Link to="/datahub" className="nav-link">
              Data Hub
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
