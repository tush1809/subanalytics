import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import "./Login.css";
import { useLogin } from "../hooks/useLogin";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, isLoading, error } = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      console.log("Login failed:", error);
    }
  };

  return (
    <div>
      <Header />

      <div className="login-container">
        <div className="login-box">
          <h1>Welcome Back!</h1>
          <p className="welcome-text">
            We're excited to see you again. Log in to access your account and continue where you left off.
          </p>
          <form>
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
              placeholder="Password"
              className="input-field"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
            <button
              type="submit"
              className="login-button"
              onClick={handleSubmit}
              disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </button>

            {error && <div className="error">{error}</div>}
          </form>

          <p className="signup-text">
            New here?{" "}
            <Link to="/signup" className="signup-link">
              Create an account
            </Link> and join us today!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
