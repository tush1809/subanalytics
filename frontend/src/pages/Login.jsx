import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn) {
      navigate('/dashboard'); 
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('isLoggedIn', true); 
    navigate('/dashboard'); 
  };

  return (
    <div>
      <Header />
      <div className="login-container">
        <div className="login-box">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" className="input-field" required />
            <input type="password" placeholder="Password" className="input-field" required />
            <button type="submit" className="login-button">Login</button>
          </form>
          <p className="signup-text">
            Don't have an account? <Link to="/signup" className="signup-link">Sign up here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
