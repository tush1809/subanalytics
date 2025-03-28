import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import "./Signup.css";
import { useSignup } from "../hooks/useSignup";

const Signup = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signup, isLoading, error } = useSignup();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup({
        firstname,
        lastname,
        email,
        password,
      });
    } catch (error) {
      console.log("Signup failed: ", error);
    }
  };

  return (
    <div>
      <Header />

      <div className="signup-container">
        <div className="signup-box">
          <h2>Welcome to SubAnalytics!</h2>
          <p className="greeting-text">
            We're excited to have you join us. Create your account to get started!
          </p>
          <form>
            <input
              type="text"
              placeholder="First Name"
              className="input-field"
              name="firstname"
              onChange={(e) => setFirstname(e.target.value)}
              value={firstname}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              className="input-field"
              name="lastname"
              onChange={(e) => setLastname(e.target.value)}
              value={lastname}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="input-field"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
            <input
              type="password"
              placeholder="Create Password"
              className="input-field"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
            <button
              type="submit"
              className="signup-button"
              onClick={handleSubmit}
              disabled={isLoading}>
              Sign Up
            </button>

            {error && <div className="error">{error}</div>}
          </form>

          <p className="login-text">
            Already have an account?{" "}
            <Link to="/login" className="login-link">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
