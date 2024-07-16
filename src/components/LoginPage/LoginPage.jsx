import React, { useState, useEffect } from 'react';
import './LoginPage.css';
import logo from '../../assets/logo.png';
import loginGif from '../../assets/login.gif';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('login-page-body');
    return () => {
      document.body.classList.remove('login-page-body');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/login`, { identifier, password });
      const { email, userId } = response.data;
      navigate('/otp', { state: { email, otpType: 'login', userId } });
    } catch (error) {
      setError(error.response?.data || 'An error occurred');
    }
  };

  return (
    <div className="login-page">
      <div className="header-container">
        <div className="logo-container">
          <img src={logo} className="logo" alt="Platform Logo" />
        </div>
        <h1>Welcome Back! Please Log In</h1>
      </div>
      <div className="login-content">
        <div className="login-form-container">
          <h2>Log In</h2>
          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              Username or Email
              <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Enter your username or registered email" required />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
            </label>
            <button type="submit">Log In</button>
          </form>
          {error && <p className="error">{error}</p>}
          <p className="register-link">
            Don't have an account? <a href="/register">Register</a>
          </p>
        </div>
        <div className="gif-container">
          <img src={loginGif} alt="Login Animation" className="gif-image" />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
