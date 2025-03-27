import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import "./Signup.css";

const Signup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSignup = (e) => {
    e.preventDefault();
    localStorage.setItem("isLoggedIn", "true"); 
    window.dispatchEvent(new Event("storage")); 
    navigate("/dashboard");
  };

  return (
    <div>
      <Header />
      <div className="signup-container">
        <div className="signup-box">
          <h2>Sign Up</h2>
          <form onSubmit={handleSignup}>
            <input type="text" placeholder="Full Name" className="input-field" required />
            <input type="email" placeholder="Email" className="input-field" required />
            <input type="password" placeholder="Create Password" className="input-field" required />
            <button type="submit" className="signup-button">Sign Up</button>
          </form>
          <p className="login-text">
            Already have an account? <Link to="/login" className="login-link">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
